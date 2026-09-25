import numpy as np, wave
from numpy.fft import rfft, irfft
SR=48000; D=15.0; N=int(SR*D); t=np.arange(N)/SR
rs=np.random.default_rng(3)
L=np.zeros(N); R=np.zeros(N)
def add(sig,start,gain=1.0,pan=0.0):
    i=int(start*SR); j=min(N,i+len(sig)); s=sig[:j-i]*gain
    L[i:j]+=s*np.sqrt((1-pan)/2); R[i:j]+=s*np.sqrt((1+pan)/2)
def band(x,lo,hi):
    X=rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X[(f<lo)|(f>hi)]=0; return irfft(X,len(x))
def env(n,a,d): x=np.arange(n)/SR; return np.minimum(1,x/max(a,1e-4))*np.exp(-x/d)
def sm(a,b,x): u=np.clip((x-a)/(b-a),0,1); return u*u*(3-2*u)
def pluck(f,dur=.35,bright=6):
    n=int(dur*SR); x=np.arange(n)/SR
    s=sum(np.sin(2*np.pi*f*k*x)*np.exp(-x*bright*k*.7)/k for k in range(1,7))
    return s*env(n,.002,dur*.4)
def kick():
    n=int(.35*SR); x=np.arange(n)/SR
    return np.tanh(2*np.sin(2*np.pi*np.cumsum(50+120*np.exp(-x*30))/SR)*np.exp(-x*8))
def clap():
    n=int(.25*SR); s=band(rs.standard_normal(n),900,7000); e=np.exp(-np.arange(n)/SR/.06); return s*e*.6
def hat(): n=int(.05*SR); return band(rs.standard_normal(n),6000,14000)*env(n,.001,.012)*.5
def whoosh(dur,lo=300,hi=6000):
    n=int(dur*SR); x=np.linspace(0,1,n); return band(rs.standard_normal(n),lo,hi)*np.sin(np.pi*x)**2
def chime(f,dur=1.2):
    n=int(dur*SR); x=np.arange(n)/SR
    return (np.sin(2*np.pi*f*x)+.5*np.sin(2*np.pi*f*2.76*x)*np.exp(-x*6)+.3*np.sin(2*np.pi*f*5.4*x)*np.exp(-x*10))*np.exp(-x*3)
# --- 0-3.4 : heat: cicadas, low drone, clock ticks
hot=1-sm(3.5,3.9,t)
cic=band(rs.standard_normal(N),4200,6500)*(0.5+0.5*np.sign(np.sin(2*np.pi*38*t)))*(0.6+0.4*np.sin(2*np.pi*.8*t))
drone=np.sin(2*np.pi*55*t)*.3+np.sin(2*np.pi*82.4*t+np.sin(t*2))*.2
bed=(cic*.18+drone*.35)*hot*sm(0,.3,t)
L+=bed; R+=bed*0.9
for k in np.arange(0.25,3.0,0.5):
    n=int(.03*SR); add(band(rs.standard_normal(n),1500,5000)*env(n,.0005,.006),k,.7,.3)
for k,f in enumerate([220,233.1,246.9,261.6,277.2,293.7]):   # rising tension, matches temp climbing
    add(pluck(f,.5,3),0.3+k*0.42,.25,-.2)
# --- AC arrival
add(whoosh(.55,200,3000),2.95,.7)
n=int(.25*SR); x=np.arange(n)/SR; add(np.sin(2*np.pi*(90+60*np.exp(-x*25))*x)*np.exp(-x*14),3.42,.9)   # thunk
for k,f in enumerate([1760,2349]):  # remote beep beep
    n=int(.09*SR); add(np.sin(2*np.pi*f*np.arange(n)/SR)*env(n,.002,.05),3.52+k*.11,.3,.3)
n=int(.3*SR); x=np.arange(n)/SR; add(band(rs.standard_normal(n),200,1200)*np.sin(np.pi*x/.3)*.3+np.sin(2*np.pi*(120+80*x)*x)*.15,3.56,.6)   # flap motor
# icy blast
add(whoosh(1.1,800,12000),3.65,1.0,-.2)
for k,f in enumerate([1318.5,1568,1975.5,2637,3136]):
    add(chime(f,1.0),3.75+k*.07,.22,(k-2)/3)
# --- music 4.0 -> 15 : 120 BPM, C - G - Am - F
BEAT=.5; start=4.0
roots=[130.8,98.0,110.0,87.3]; chords=[(261.6,329.6,392),(246.9,293.7,392),(261.6,329.6,440),(261.6,349.2,440)]
nb=int((15-start)/BEAT)
for b in range(nb):
    st=start+b*BEAT; bar=(b//4)%4
    add(kick(),st,.9)
    if b%2==1: add(clap(),st,.45)
    add(hat(),st+BEAT/2,.55,.35); add(hat(),st+BEAT*.25,.2,-.35); add(hat(),st+BEAT*.75,.2,-.35)
    n=int(BEAT*.9*SR); x=np.arange(n)/SR
    bass=np.sin(2*np.pi*roots[bar]/2*x)*.6+np.sin(2*np.pi*roots[bar]*x)*.25
    add(bass*env(n,.005,.25),st,.5)
    # arpeggio 1/8ths
    ch=chords[bar]
    for k in range(2):
        f=ch[(b*2+k)%3]*(2 if (b*2+k)%4==3 else 1)
        add(pluck(f,.3,5),st+k*BEAT/2,.16,(-.4 if k else .4))
# lift the music gently in
m=sm(3.9,4.4,t)
# transitions
add(whoosh(.45,300,8000),7.62,.7,.2)
add(whoosh(.45,300,8000),11.28,.7,-.2)
# feature pops (match video: 8.0 + .45 + i*.38 + .15)
for i in range(4):
    st=8.0+.45+i*.38+.15
    n=int(.12*SR); x=np.arange(n)/SR; add(np.sin(2*np.pi*(600+900*x/.12)*x)*env(n,.002,.04),st,.35,(i-1.5)/3)
    add(chime([1046.5,1174.7,1318.5,1568][i],.6),st+.2,.14)
# logo sting 11.7
for k,f in enumerate([523.3,659.3,784,1046.5]): add(chime(f,1.8),11.72+k*.05,.22,(k-1.5)/3)
add(kick(),11.7,1.0)
add(whoosh(.5,2000,12000),11.65,.4)
# badge + CTA pops
for st,f in [(13.15,880),(13.45,660)]:
    n=int(.15*SR); x=np.arange(n)/SR; add(np.sin(2*np.pi*f*(1+x*3)*x)*env(n,.002,.05),st,.4)
# final chord
n=int(1.4*SR); x=np.arange(n)/SR
fin=sum(np.sin(2*np.pi*f*x)*np.exp(-x*1.4) for f in (261.6,329.6,392,523.3))/4
add(fin,13.6,.5)
# master
fade=np.ones(N); fi=int(14.6*SR); fade[fi:]=np.linspace(1,0,N-fi)
L*=fade; R*=fade
mx=max(abs(L).max(),abs(R).max()); L=np.tanh(1.4*L/mx)/np.tanh(1.4); R=np.tanh(1.4*R/mx)/np.tanh(1.4)
st=(np.stack([L,R],1)*0.9*32767).astype(np.int16)
w=wave.open('audio.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes()); w.close(); print('ok')
