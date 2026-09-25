import numpy as np, wave
SR=48000; D=15.0; N=int(SR*D); t=np.arange(N)/SR
L=np.zeros(N); R=np.zeros(N)
rs=np.random.default_rng(1)
def add(sig,start,gain=1.0,pan=0.0):
    i=int(start*SR); j=min(N,i+len(sig)); s=sig[:j-i]*gain
    L[i:j]+=s*(1-pan)*0.5*2**0.5*0.71; R[i:j]+=s*(1+pan)*0.5*2**0.5*0.71
def env(n,a,d):
    x=np.arange(n)/SR; return np.minimum(1,x/max(a,1e-4))*np.exp(-x/d)
def kick():
    n=int(.45*SR); x=np.arange(n)/SR
    f=45+110*np.exp(-x*28); ph=2*np.pi*np.cumsum(f)/SR
    return np.tanh(2.2*np.sin(ph)*np.exp(-x*7))
def hat(open_=False):
    n=int((.25 if open_ else .06)*SR); s=rs.standard_normal(n)
    s=np.diff(np.concatenate([[0],s]))  # highpass-ish
    return s*env(n,.001,.08 if open_ else .015)*.35
def clap():
    n=int(.3*SR); s=rs.standard_normal(n); e=np.zeros(n)
    for k in (0,.011,.022): i=int(k*SR); e[i:]+=np.exp(-np.arange(n-i)/SR/.012)
    e+=np.exp(-np.arange(n)/SR/.09)*.6
    s=np.convolve(s,[1,-0.6],'same'); return s*e*.45
def whoosh(dur,up=True):
    n=int(dur*SR); s=rs.standard_normal(n); x=np.linspace(0,1,n)
    # sweep lowpass via one-pole with varying coefficient
    cut=(x if up else 1-x)**2*0.6+0.02; y=np.zeros(n); acc=0
    for i in range(n): acc+= cut[i]*(s[i]-acc); y[i]=acc
    amp=np.sin(np.pi*x)**1.5 if not up else x**2
    return y*amp*1.2
def impact():
    n=int(1.6*SR); x=np.arange(n)/SR
    boom=np.sin(2*np.pi*np.cumsum(38+60*np.exp(-x*6))/SR)*np.exp(-x*2.2)
    nz=rs.standard_normal(n)*np.exp(-x*9)*.3
    return np.tanh(1.8*(boom+nz))
def tone(freq,dur,shape='saw',a=.005,d=.3):
    n=int(dur*SR); x=np.arange(n)/SR
    if shape=='saw': s=sum(np.sin(2*np.pi*freq*k*x)/k for k in range(1,9))*.6
    else: s=np.sin(2*np.pi*freq*x)
    return s*env(n,a,d)
def type_click():
    n=int(.03*SR); return rs.standard_normal(n)*env(n,.0005,.004)*.5

BEAT=.5
# --- 0-2s: intro: pad swell + typing clicks + burst impact at 1.0
padn=int(2.2*SR); x=np.arange(padn)/SR
pad=sum(np.sin(2*np.pi*f*x+rs.random()*6) for f in (110,164.8,220,277.2,329.6))/5
add(pad*np.minimum(1,x/1.2)*np.exp(-np.maximum(0,x-1.6)*4)*.35,0)
for k in range(8): add(type_click(),0.35+k*0.08,.8,pan=rs.uniform(-.4,.4))
add(impact(),1.0,.8)
add(whoosh(.45,True),1.55,.35)
# --- 2-4.5s: letter slams (6 hits) on 1/8ths from 2.5
add(kick(),2.0,.9)
for i in range(6): add(kick(),2.5+i*.125,.55); add(clap(),2.5+i*.125,.35,pan=(i-2.5)/4)
add(impact(),3.25,.5)
add(whoosh(1.0,True),3.5,.55)   # riser into drop
# --- 4.5-11.5: main groove 120 BPM
bass_notes=[55,55,65.4,49]  # A, A, C, G per bar(2s)
for b in range(int((11.5-4.5)/BEAT)):
    st=4.5+b*BEAT
    add(kick(),st,1.0)
    if b%2==1: add(clap(),st,.55)
    add(hat(),st+BEAT/2,.6,pan=.3); add(hat(),st+BEAT/4,.25,pan=-.3); add(hat(),st+3*BEAT/4,.25,pan=-.3)
    f=bass_notes[(b//4)%4]
    add(tone(f,BEAT*.9,'saw',.003,.18)*.35,st+.05)
# card cuts: whoosh + chord stab each second
chords=[(220,277.2,329.6),(261.6,329.6,392),(196,246.9,293.7),(220,277.2,329.6)]
for i,c in enumerate(chords):
    st=4.5+i*1.0
    add(sum(tone(f,.6,'saw',.002,.12) for f in c)*.12,st, pan=(-.3 if i%2 else .3))
    if i: add(whoosh(.25,False),st-.12,.3)
# section 4 strikes 8.5-11.5
for k,st in enumerate([8.5,8.85,9.25,9.65,10.1]):
    add(tone([440,392,523.3,659.3,587.3][k],.35,'sine',.002,.12)*.3,st)
for i in range(3): add(tone(880*(1.25**i),.2,'sine',.001,.06)*.25,10.4+i*.12)
add(whoosh(1.1,True),10.4,.6)
# --- 11.5-15: converge swell, pop at 12.45, outro
swn=int(1.0*SR); x=np.arange(swn)/SR
sw=np.sin(2*np.pi*np.cumsum(200+900*(x/1.0)**2)/SR)*(x/1.0)**2*.15
add(sw,11.5)
add(impact(),12.45,1.0)
add(kick(),12.45,1.0)
outn=int(2.6*SR); x=np.arange(outn)/SR
chord=sum(np.sin(2*np.pi*f*x)+.3*np.sin(2*np.pi*2*f*x) for f in (220,277.2,329.6,440,554.4))/5
add(chord*np.minimum(1,x/.05)*np.exp(-x*.9)*.4,12.45)
for i,f in enumerate([880,1108.7,1318.5,1760]): add(tone(f,.5,'sine',.002,.2)*.18,13.7+i*.09,pan=(i-1.5)/2)
# master: fade out, soft clip, normalize
fade=np.ones(N); fi=int(14.5*SR); fade[fi:]=np.linspace(1,0,N-fi)
L*=fade; R*=fade
m=max(abs(L).max(),abs(R).max()); L=np.tanh(1.3*L/m)/np.tanh(1.3); R=np.tanh(1.3*R/m)/np.tanh(1.3)
st=(np.stack([L,R],1)*0.89*32767).astype(np.int16)
w=wave.open('audio.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes()); w.close()
print('ok')
