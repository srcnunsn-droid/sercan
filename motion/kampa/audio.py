import numpy as np, wave
from numpy.fft import rfft, irfft
SR=48000; D=15.0; N=int(SR*D); t=np.arange(N)/SR
rs=np.random.default_rng(11)
L=np.zeros(N); R=np.zeros(N)
def add(sig,start,gain=1.0,pan=0.0):
    i=int(start*SR); j=min(N,i+len(sig)); s=sig[:j-i]*gain
    L[i:j]+=s*np.sqrt((1-pan)/2); R[i:j]+=s*np.sqrt((1+pan)/2)
def band(x,lo,hi):
    X=rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X[(f<lo)|(f>hi)]=0; return irfft(X,len(x))
def env(n,a,d): x=np.arange(n)/SR; return np.minimum(1,x/max(a,1e-4))*np.exp(-x/d)
def sm(a,b,x): u=np.clip((x-a)/(b-a),0,1); return u*u*(3-2*u)
def pluck(f,dur=.35,bright=5):
    n=int(dur*SR); x=np.arange(n)/SR
    return sum(np.sin(2*np.pi*f*k*x)*np.exp(-x*bright*k*.7)/k for k in range(1,7))*env(n,.002,dur*.4)
def kick():
    n=int(.35*SR); x=np.arange(n)/SR
    return np.tanh(2*np.sin(2*np.pi*np.cumsum(48+120*np.exp(-x*30))/SR)*np.exp(-x*8))
def clap(): n=int(.25*SR); return band(rs.standard_normal(n),900,7000)*np.exp(-np.arange(n)/SR/.06)*.6
def hat(): n=int(.05*SR); return band(rs.standard_normal(n),6000,14000)*env(n,.001,.012)*.5
def whoosh(dur,lo=300,hi=7000): n=int(dur*SR); x=np.linspace(0,1,n); return band(rs.standard_normal(n),lo,hi)*np.sin(np.pi*x)**2
def chime(f,dur=1.2):
    n=int(dur*SR); x=np.arange(n)/SR
    return (np.sin(2*np.pi*f*x)+.5*np.sin(2*np.pi*f*2.76*x)*np.exp(-x*6)+.3*np.sin(2*np.pi*f*5.4*x)*np.exp(-x*10))*np.exp(-x*3)
def bloop(f0,f1,dur=.08):
    n=int(dur*SR); x=np.arange(n)/SR; fr=f0*(f1/f0)**(x/dur); return np.sin(2*np.pi*np.cumsum(fr)/SR)*env(n,.002,dur*.5)
# water: rushing + bubbles in intro
wat=band(rs.standard_normal(N),200,3000)*sm(0,.8,t)*(1-sm(2.0,2.6,t))
L+=wat*.35; R+=wat*.35
for st in np.sort(rs.uniform(0.2,2.3,45)): add(bloop(rs.uniform(300,700),rs.uniform(900,1800),rs.uniform(.04,.09)),st,.25,rs.uniform(-.8,.8))
n=int(1.0*SR); x=np.arange(n)/SR; add(band(rs.standard_normal(n),300,8000)*np.exp(-x*4)*1.2,0.95,.6)  # splash
# underwater bubbles light under all studio scenes
for st in np.sort(rs.uniform(2.5,15,40)): add(bloop(rs.uniform(400,800),rs.uniform(1000,2000),.06),st,.07,rs.uniform(-.8,.8))
# pump motor: starts when product lands (2.5 -> 3.4), hum stays low
fm=sm(2.5,3.4,t)*(1-sm(5.3,5.7,t))*1.0 + sm(5.7,6.0,t)*.35*(1-sm(12.3,12.7,t))
motor=(np.sin(2*np.pi*np.cumsum(50+50*sm(2.5,3.4,t))/SR)*.5+np.sin(2*np.pi*np.cumsum(150+150*sm(2.5,3.4,t))/SR)*.2+band(rs.standard_normal(N),120,900)*.3)*fm
L+=motor*.22; R+=motor*.22
# music 120 BPM in G: G - D - Em - C, enters with first wipe
BEAT=.5; start=2.4
roots=[98.0,73.4,82.4,65.4]; chords=[(392,493.9,587.3),(370,440,587.3),(392,493.9,659.3),(392,523.3,659.3)]
for b in range(int((15-start)/BEAT)):
    st=start+b*BEAT; bar=(b//4)%4
    add(kick(),st,.85)
    if b%2==1: add(clap(),st,.4)
    add(hat(),st+BEAT/2,.5,.35); add(hat(),st+BEAT*.25,.18,-.35); add(hat(),st+BEAT*.75,.18,-.35)
    n=int(BEAT*.9*SR); x=np.arange(n)/SR
    add((np.sin(2*np.pi*roots[bar]*x)*.6+np.sin(2*np.pi*roots[bar]*2*x)*.2)*env(n,.005,.25),st,.55)
    ch=chords[bar]
    for k in range(2): add(pluck(ch[(b*2+k)%3],.3,5),st+k*BEAT/2,.14,(-.4 if k else .4))
# intro pad (before beat)
n=int(2.6*SR); x=np.arange(n)/SR
add(sum(np.sin(2*np.pi*f*x) for f in (196,246.9,293.7,392))/4*np.minimum(1,x/1.2)*np.exp(-np.maximum(0,x-2.2)*6),0,.35)
# wipes
for st in (2.0,5.3,12.3): add(whoosh(.7,300,9000),st,.8,.1)
add(whoosh(.6,2000,12000),3.3,.35)                       # shine sweep
# callout pops + gauge ticks
for i in range(3): add(bloop(700,1500,.1),5.7+.3+i*.45,.35,(i-1)/2)
for i in range(3):
    st=5.7+1.9+i*.3
    for k in range(12): add(bloop(1800+k*60,2000+k*60,.02),st+k*(1.0/12)*(1-k/24),.12,(i-1)/2)
    add(chime([784,987.8,1174.7][i],.8),st+1.0,.18,(i-1)/2)
# offer: flash cut hit, strike swish, price roll ticks, register ding
add(kick(),9.8,1.0); add(whoosh(.3,1000,9000),9.78,.5)
add(whoosh(.25,3000,12000),10.5,.4)
for k in range(16): add(bloop(2400,2600,.015),10.65+k*.045,.12)
for f,dl in [(1318.5,0),(1760,.08)]: add(chime(f,1.2),11.42+dl,.3)
for i in range(3): add(bloop(600,1200,.09),11.5+i*.15,.3,(i-1)/2)
# logo sting + CTA
for k,f in enumerate([587.3,784,987.8,1174.7]): add(chime(f,2.0),12.82+k*.06,.24,(k-1.5)/3)
add(kick(),12.8,1.0)
add(bloop(500,1100,.14),13.7,.4)
n=int(1.6*SR); x=np.arange(n)/SR
add(sum(np.sin(2*np.pi*f*x)*np.exp(-x*1.3) for f in (196,293.7,392,493.9))/4,13.9,.5)
fade=np.ones(N); fi=int(14.5*SR); fade[fi:]=np.linspace(1,0,N-fi); L*=fade; R*=fade
mx=max(abs(L).max(),abs(R).max()); L=np.tanh(1.4*L/mx)/np.tanh(1.4); R=np.tanh(1.4*R/mx)/np.tanh(1.4)
st=(np.stack([L,R],1)*0.9*32767).astype(np.int16)
w=wave.open('audio.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes()); w.close(); print('ok')
