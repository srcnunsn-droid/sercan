import numpy as np, wave
from numpy.fft import rfft, irfft
SR=48000; D=15.0; N=int(SR*D); t=np.arange(N)/SR
rs=np.random.default_rng(7)
L=np.zeros(N); R=np.zeros(N)
def add(sig,start,gain=1.0,pan=0.0):
    i=int(start*SR); 
    if i<0: sig=sig[-i:]; i=0
    j=min(N,i+len(sig)); s=sig[:j-i]*gain
    L[i:j]+=s*np.sqrt((1-pan)/2); R[i:j]+=s*np.sqrt((1+pan)/2)
def band(x,lo,hi):
    X=rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X[(f<lo)|(f>hi)]=0; return irfft(X,len(x))
def lp1(x,a):  # one-pole lowpass with per-sample or scalar coeff
    y=np.empty_like(x); acc=0.0; a=np.broadcast_to(a,x.shape)
    for i in range(len(x)): acc+=a[i]*(x[i]-acc); y[i]=acc
    return y
def env(n,a,d): x=np.arange(n)/SR; return np.minimum(1,x/max(a,1e-4))*np.exp(-x/d)
def sm(a,b,x): u=np.clip((x-a)/(b-a),0,1); return u*u*(3-2*u)

slow = sm(4.45,4.8,t)*(1-sm(5.1,5.45,t))           # slow-mo amount (matches video)
duck = 1-0.7*slow
# 1) wind + jet engine bed (whole clip), muffled in slow-mo
wind=band(rs.standard_normal(N),80,1800)
wind*= (0.5+0.25*np.sin(t*0.7)+0.15*np.sin(t*1.9))
fall=sm(7.0,13.3,t)
wind_hi=band(rs.standard_normal(N),900,5000)*fall*1.3          # rising roar while falling
jet=band(rs.standard_normal(N),150,600)*0.8 + 0.25*np.sin(2*np.pi*np.cumsum(62+4*np.sin(t*3))/SR)
jet*= (1-0.6*sm(5.0,5.4,t))                                    # engine loses power
bed=(wind*0.55+jet*0.6+wind_hi*0.9)*duck
bed*= 1-0.85*sm(13.3,13.9,t)                                   # into the clouds: muffled
L+=bed*0.8; R+=bed*0.8
# whine pitching down as plane dives
wf=900-500*sm(7.0,13.3,t); whine=np.sin(2*np.pi*np.cumsum(wf)/SR)*0.05*sm(7.3,9,t)*(1-sm(13.2,13.8,t))
add(whine,0,1,0.2)
# 2) cinematic drone music (D minor), swells toward impact and fall
def pad(freqs,dur,att,rel):
    n=int(dur*SR); x=np.arange(n)/SR; s=sum(np.sin(2*np.pi*f*x+rs.random()*6)+0.35*np.sin(2*np.pi*2.003*f*x) for f in freqs)/len(freqs)
    e=np.minimum(1,x/att)*np.minimum(1,(dur-x)/rel); return s*np.clip(e,0,1)
add(pad([73.4,110,146.8,174.6],5.0,2.5,.6),0,.22)
add(pad([69.3,103.8,138.6,164.8],4.0,.3,1.2),5.0,.26)      # dissonant after hit
add(pad([58.3,87.3,116.5,138.6,174.6],8.0,1.5,2.0),7.0,.3)
# heartbeat pulses 7-13
for k,st in enumerate(np.arange(7.0,13.2,0.62)):
    n=int(.35*SR); x=np.arange(n)/SR; add(np.sin(2*np.pi*(48+30*np.exp(-x*30))*x)*np.exp(-x*9),st,.5)
    add(np.sin(2*np.pi*(48+30*np.exp(-x*30))*x)*np.exp(-x*9),st+.18,.3)
# 3) meteor: rising whistle + roar 3.2 -> 5.0
n=int(1.8*SR); x=np.arange(n)/SR; u=x/1.8
roar=band(rs.standard_normal(n),200,4000)*u**2.5
whis=np.sin(2*np.pi*np.cumsum(500+1400*u**2)/SR)*u**2*0.25
add((roar*0.9+whis),3.2,.8,pan=0.4)
# slow-mo "time bend" deep sweep
n=int(1.0*SR); x=np.arange(n)/SR
add(np.sin(2*np.pi*np.cumsum(220*np.exp(-x*2.5)+30)/SR)*np.sin(np.pi*x/1.0)*0.35,4.45,.8)
# 4) IMPACT 5.0
n=int(3.0*SR); x=np.arange(n)/SR
boom=np.tanh(2.5*np.sin(2*np.pi*np.cumsum(30+90*np.exp(-x*5))/SR)*np.exp(-x*1.3))
crack=band(rs.standard_normal(n),600,9000)*np.exp(-x*6)
rumble=band(rs.standard_normal(n),30,250)*np.exp(-x*.9)*1.5
add(boom*1.0+crack*0.9+rumble*0.8,5.0,1.0)
# metal shriek / tearing
n=int(1.2*SR); x=np.arange(n)/SR
metal=sum(np.sin(2*np.pi*f*x*(1-0.12*x))*np.exp(-x*(2+k)) for k,f in enumerate([523,811,1187,1630]))*0.12
add(metal,5.05,1,-.3)
# debris clanks
for k in range(9):
    st=5.2+rs.random()*1.6; n=int(.15*SR); f=1500+rs.random()*2500
    add(np.sin(2*np.pi*f*np.arange(n)/SR)*env(n,.001,.03)*0.15,st,1,rs.uniform(-.7,.7))
# 5) fire crackle from 5.2, growing
crk=np.zeros(N); fire_amt=sm(5.2,6.8,t)*(1-0.7*sm(13.3,13.9,t))
times=np.sort(rs.uniform(5.2,15,1400))
for st in times:
    i=int(st*SR); n=int(.012*SR)
    if i+n<N: crk[i:i+n]+=rs.standard_normal(n)*env(n,.0003,.002)*rs.uniform(.2,1)
roarF=band(rs.standard_normal(N),60,700)*0.7
firebed=(crk*0.5+roarF)*fire_amt
L+=firebed*0.55; R+=firebed*0.65
# flare-up pops (match video bursts)
for st in [5.91,6.82,7.73,8.64,9.55,10.45,11.37,12.28,13.18,14.09]:
    n=int(.6*SR); x=np.arange(n)/SR
    pop=np.tanh(2*np.sin(2*np.pi*(55+70*np.exp(-x*12))*x))*np.exp(-x*6)+band(rs.standard_normal(n),300,5000)*np.exp(-x*10)*.5
    add(pop,st,.45*(0.35 if st>13.4 else 1),rs.uniform(-.2,.2))
# 6) cockpit alarm (two-tone) 6.2 -> 13.3
for k,st in enumerate(np.arange(6.2,13.3,0.8)):
    n=int(.28*SR); x=np.arange(n)/SR
    tone=np.sign(np.sin(2*np.pi*(960 if k%2==0 else 760)*x))*0.5+np.sin(2*np.pi*1920*x)*.2
    add(band(tone*env(n,.005,.2),300,4000),st,.07,0.1)
# 7) into the clouds: muffled whoomp + ending low tone
n=int(1.6*SR); x=np.arange(n)/SR
add(band(rs.standard_normal(n),40,400)*np.sin(np.pi*x/1.6)*1.2,13.2,.6)
add(np.sin(2*np.pi*36.7*x)*np.exp(-x*1.2)*.6,13.5,.8)
# master
fade=np.ones(N); fade[:int(.5*SR)]=np.linspace(0,1,int(.5*SR)); fi=int(14.2*SR); fade[fi:]=np.linspace(1,0,N-fi)
L*=fade; R*=fade
m=max(abs(L).max(),abs(R).max()); L=np.tanh(1.6*L/m)/np.tanh(1.6); R=np.tanh(1.6*R/m)/np.tanh(1.6)
st=(np.stack([L,R],1)*0.9*32767).astype(np.int16)
w=wave.open('audio.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes()); w.close(); print('ok')
