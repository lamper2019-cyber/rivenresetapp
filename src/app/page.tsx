'use client';

import { useState, useRef } from 'react';
import { UserData, defaultUserData, Scores, getScoreColor } from '@/lib/types';
import { calculateScores, assignProfile, profileNames, profileDescriptions, calculateMaintenance, calculateBodyFat, ProfileType } from '@/lib/scoring';
import { restaurantOrders, restaurantList } from '@/lib/restaurants';
import { getStuckItems, getMorningProtein, getStepSuggestion, getActionItems, getWaterTarget } from '@/lib/content';

export default function Home() {
  const [screen, setScreen] = useState(0);
  const [data, setData] = useState<UserData>(defaultUserData);
  const [scores, setScores] = useState<Scores | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [showResults, setShowResults] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const update = (partial: Partial<UserData>) => setData(prev => ({ ...prev, ...partial }));

  const goNext = () => {
    if (screen < 6) {
      setScreen(s => s + 1);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      const s = calculateScores(data);
      const p = assignProfile(data);
      setScores(s);
      setProfile(p);
      setShowResults(false);
      setScreen(7);
      setTimeout(() => setShowResults(true), 1000);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const goBack = () => {
    if (screen > 0) {
      setScreen(s => s - 1);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const maintenance = calculateMaintenance(data);
  const bodyFat = calculateBodyFat(data.weight, data.heightFt, data.heightIn, data.age);
  const goalBodyFat = calculateBodyFat(data.goalWeight, data.heightFt, data.heightIn, data.age);

  async function downloadPDF() {
    const { generatePDF } = await import('@/lib/pdf');
    if (!scores || !profile) return;
    const doc = generatePDF(data, scores, profile);
    doc.save(`RIVEN-Reset-${data.name || 'Results'}.pdf`);
  }

  return (
    <div className="min-h-screen bg-black" ref={topRef}>
      <div className="max-w-md mx-auto px-5 py-6 min-h-screen flex flex-col">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl tracking-[0.3em] text-[#C8A951]">RIVEN</h1>
        </div>

        {/* Screen content */}
        <div className="flex-1">
          {screen === 0 && <Screen1 data={data} update={update} maintenance={maintenance} bodyFat={bodyFat} goalBodyFat={goalBodyFat} />}
          {screen === 1 && <Screen2 data={data} update={update} />}
          {screen === 2 && <Screen3 data={data} update={update} />}
          {screen === 3 && <Screen4 data={data} update={update} />}
          {screen === 4 && <Screen5 data={data} update={update} />}
          {screen === 5 && <Screen6 data={data} update={update} />}
          {screen === 6 && <Screen6b data={data} update={update} />}
          {screen === 7 && scores && profile && (
            <Screen7 data={data} scores={scores} profile={profile} showResults={showResults} downloadPDF={downloadPDF} />
          )}
        </div>

        {/* Navigation */}
        {screen < 7 && (
          <div className="flex items-center justify-between mt-8 pb-6">
            {screen > 0 ? (
              <button onClick={goBack} className="text-[#888] flex items-center gap-2 text-sm">
                &larr; BACK
              </button>
            ) : <div />}
            <button
              onClick={goNext}
              className={`px-10 py-4 rounded-full font-bold text-black text-sm tracking-wider transition-all ${
                screen === 6 ? 'bg-[#C8A951] pulse-gold text-lg px-12' : 'bg-[#C8A951] hover:bg-[#d4b85e]'
              }`}
            >
              {screen === 6 ? 'SEE MY RESULTS →' : 'NEXT →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN 1 — ABOUT YOU
   ============================================================ */
function Screen1({ data, update, maintenance, bodyFat, goalBodyFat }: {
  data: UserData; update: (p: Partial<UserData>) => void;
  maintenance: number; bodyFat: number; goalBodyFat: number;
}) {
  return (
    <div className="space-y-6 fade-in-up">
      <div className="mb-2">
        <h2 className="text-4xl font-display text-white leading-tight">Let&apos;s learn</h2>
        <h2 className="text-4xl font-display text-[#C8A951] italic leading-tight">about you.</h2>
      </div>

      <Card label="IDENTITY">
        <input
          type="text"
          placeholder="First name"
          value={data.name}
          onChange={e => update({ name: e.target.value })}
          className="w-full bg-transparent border border-[#C8A951]/40 rounded-lg px-4 py-4 text-white text-lg focus:outline-none focus:border-[#C8A951] placeholder-[#555]"
        />
      </Card>

      <Card label="PHYSICAL MARKERS">
        <div className="grid grid-cols-2 gap-4">
          <NumberPicker label="AGE" value={data.age} onChange={v => update({ age: v })} min={16} max={80} />
          <HeightPicker ft={data.heightFt} inches={data.heightIn} onChangeFt={v => update({ heightFt: v })} onChangeIn={v => update({ heightIn: v })} />
          <NumberPicker label="WEIGHT (LBS)" value={data.weight} onChange={v => update({ weight: v })} min={80} max={500} />
          <NumberPicker label="GOAL (LBS)" value={data.goalWeight} onChange={v => update({ goalWeight: v })} min={80} max={500} />
        </div>
      </Card>

      <Card label="METABOLIC INSIGHT" gold>
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/80 text-sm">Daily Caloric<br/>Burn</span>
          <div className="text-right">
            <span className="text-4xl font-display text-white">{maintenance.toLocaleString()}</span>
            <span className="text-[#888] text-xs block">CAL/DAY</span>
          </div>
        </div>
        <div className="border-t border-white/10 pt-4 flex justify-between">
          <div>
            <div className="text-[#888] text-xs uppercase mb-1">Est. Body Fat</div>
            <div className="text-[#C8A951] text-2xl font-display">{bodyFat}%</div>
          </div>
          <div>
            <div className="text-[#888] text-xs uppercase mb-1">At Goal Weight</div>
            <div className="text-[#C8A951] text-2xl font-display">{goalBodyFat}%</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   SCREEN 2 — YOUR STORY
   ============================================================ */
function Screen2({ data, update }: { data: UserData; update: (p: Partial<UserData>) => void }) {
  return (
    <div className="space-y-8 fade-in-up">
      <div>
        <p className="text-[#C8A951] text-xs tracking-widest uppercase mb-1">CURATION STEP 02</p>
        <h2 className="text-4xl font-display text-white leading-tight">Your journey</h2>
        <h2 className="text-4xl font-display text-[#C8A951] italic leading-tight">so far.</h2>
        <div className="w-12 h-1 bg-[#C8A951] mt-2 rounded" />
      </div>

      <div className="space-y-2">
        <StepLabel num="01" text="How long have you been trying to lose weight?" />
        <PillGroup
          options={['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years']}
          selected={data.howLong}
          onSelect={v => update({ howLong: v })}
        />
      </div>

      <div className="space-y-2">
        <StepLabel num="02" text="What have you tried before?" />
        <PillGroupMulti
          options={['Calorie counting', 'Keto', 'Intermittent Fasting', 'Paleo', 'Vegan', 'Commercial Plans']}
          selected={data.triedBefore}
          onToggle={v => {
            const next = data.triedBefore.includes(v)
              ? data.triedBefore.filter(x => x !== v)
              : [...data.triedBefore, v];
            update({ triedBefore: next });
          }}
        />
      </div>

      <div className="space-y-2">
        <StepLabel num="03" text="Why now?" />
        {['Health scare or advice', 'Event coming up', 'Just tired of feeling this way'].map(opt => (
          <button
            key={opt}
            onClick={() => update({ whyNow: opt })}
            className={`w-full text-left p-4 rounded-xl transition-all ${
              data.whyNow === opt
                ? 'bg-[#C8A951]/20 border-2 border-[#C8A951] text-[#C8A951]'
                : 'bg-[#141414] border-2 border-transparent text-white/80'
            }`}
          >
            <div className="font-semibold text-sm">{opt}</div>
            <div className="text-xs opacity-60 mt-0.5">
              {opt === 'Health scare or advice' && 'Doctor recommendations or recent screenings'}
              {opt === 'Event coming up' && 'Wedding, vacation, or major milestone'}
              {opt === 'Just tired of feeling this way' && 'A general desire for a lifestyle change'}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN 3 — YOUR LIFESTYLE
   ============================================================ */
function Screen3({ data, update }: { data: UserData; update: (p: Partial<UserData>) => void }) {
  return (
    <div className="space-y-8 fade-in-up">
      <div>
        <p className="text-[#C8A951] text-xs tracking-widest uppercase mb-1">CURATION STEP 03</p>
        <h2 className="text-4xl font-display text-white leading-tight">Your daily</h2>
        <h2 className="text-4xl font-display text-[#C8A951] italic leading-tight">life.</h2>
        <div className="w-12 h-1 bg-[#C8A951] mt-2 rounded" />
      </div>

      <Card label="SLEEP QUALITY">
        <SliderInput label="How would you rate your sleep?" value={data.sleepQuality} onChange={v => update({ sleepQuality: v })} />
      </Card>

      <Card label="STRESS LEVEL">
        <SliderInput label="How stressed are you on a typical day?" value={data.stressLevel} onChange={v => update({ stressLevel: v })} />
      </Card>

      <Card label="ENERGY LEVELS">
        <SliderInput label="Morning energy (1-10)" value={data.energyMorning} onChange={v => update({ energyMorning: v })} />
        <div className="mt-4">
          <SliderInput label="Afternoon energy (1-10)" value={data.energyAfternoon} onChange={v => update({ energyAfternoon: v })} />
        </div>
      </Card>

      <Card label="WORK & FAMILY">
        <p className="text-[#888] text-xs uppercase tracking-wider mb-3">Work type</p>
        <PillGroup
          options={['Desk job', 'On your feet', 'Hybrid', 'Work from home', 'Shift work']}
          selected={data.workType}
          onSelect={v => update({ workType: v })}
        />
        <p className="text-[#888] text-xs uppercase tracking-wider mb-3 mt-5">Kids?</p>
        <PillGroup
          options={['No kids', '1-2 kids', '3+ kids']}
          selected={data.kids}
          onSelect={v => update({ kids: v })}
        />
      </Card>
    </div>
  );
}

/* ============================================================
   SCREEN 4 — YOUR EATING
   ============================================================ */
function Screen4({ data, update }: { data: UserData; update: (p: Partial<UserData>) => void }) {
  const breakfastOptions = [
    { label: 'Skip it', icon: '☕' },
    { label: 'Coffee and pastry', icon: '🥐' },
    { label: 'Cereal or toast', icon: '🥣' },
    { label: 'Eggs or protein', icon: '🍳' },
    { label: 'Smoothie', icon: '🥤' },
    { label: 'Fast food', icon: '🍔' },
  ];

  return (
    <div className="space-y-8 fade-in-up">
      <div>
        <p className="text-[#C8A951] text-xs tracking-widest uppercase mb-1">CURATION STEP 04</p>
        <h2 className="text-4xl font-display text-white leading-tight">What you</h2>
        <h2 className="text-4xl font-display text-[#C8A951] italic leading-tight">eat.</h2>
        <div className="w-12 h-1 bg-[#C8A951] mt-2 rounded" />
      </div>

      <div className="space-y-3">
        <p className="text-white font-semibold">What do you eat for breakfast?</p>
        <div className="grid grid-cols-2 gap-3">
          {breakfastOptions.map(opt => (
            <button
              key={opt.label}
              onClick={() => update({ breakfast: opt.label })}
              className={`p-4 rounded-xl text-left transition-all ${
                data.breakfast === opt.label
                  ? 'bg-[#1a1a1a] border-2 border-[#C8A951] shadow-[0_0_15px_rgba(200,169,81,0.2)]'
                  : 'bg-[#141414] border-2 border-transparent'
              }`}
            >
              <div className="text-2xl mb-2">{opt.icon}</div>
              <div className="text-white text-sm">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-white font-semibold">When do you snack most?</p>
        <PillGroup
          options={['Morning', 'Afternoon', 'After dinner', 'Late night', "Don't really snack"]}
          selected={data.snackTime}
          onSelect={v => update({ snackTime: v })}
        />
      </div>

      <div className="space-y-2">
        <p className="text-white font-semibold">How many sugary drinks per week?</p>
        <PillGroup
          options={['None', '1-3', '4-7', 'Daily']}
          selected={data.sugaryDrinks}
          onSelect={v => update({ sugaryDrinks: v })}
        />
      </div>

      <div className="space-y-2">
        <p className="text-white font-semibold">How often do you eat out?</p>
        <PillGroup
          options={['Rarely', '1-2', '3-4', '5+', 'Almost every meal']}
          selected={data.eatingOut}
          onSelect={v => update({ eatingOut: v })}
        />
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN 5 — YOUR RESTAURANTS
   ============================================================ */
function Screen5({ data, update }: { data: UserData; update: (p: Partial<UserData>) => void }) {
  const toggle = (name: string) => {
    if (data.restaurants.includes(name)) {
      update({ restaurants: data.restaurants.filter(r => r !== name) });
    } else if (data.restaurants.length < 3) {
      update({ restaurants: [...data.restaurants, name] });
    }
  };

  return (
    <div className="space-y-6 fade-in-up">
      <div>
        <p className="text-[#C8A951] text-xs tracking-widest uppercase mb-1">CURATION STEP 05</p>
        <h2 className="text-4xl font-display text-white leading-tight">Where do</h2>
        <h2 className="text-4xl font-display text-[#C8A951] italic leading-tight">you eat?</h2>
      </div>

      <div className="bg-[#1a1a1a] rounded-full px-5 py-2 text-center">
        <span className="text-[#888] text-sm mr-2">SELECTED:</span>
        <span className="text-[#C8A951] font-display text-xl">{data.restaurants.length}/3</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {restaurantList.map(name => {
          const selected = data.restaurants.includes(name);
          return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className={`p-4 rounded-xl text-center transition-all relative ${
                selected
                  ? 'bg-[#1a1a1a] border-2 border-[#C8A951] shadow-[0_0_15px_rgba(200,169,81,0.2)]'
                  : 'bg-[#141414] border-2 border-transparent'
              }`}
            >
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#C8A951] flex items-center justify-center">
                  <span className="text-black text-xs font-bold">✓</span>
                </div>
              )}
              <span className="text-white text-sm">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN 6 — YOUR MOVEMENT
   ============================================================ */
function Screen6({ data, update }: { data: UserData; update: (p: Partial<UserData>) => void }) {
  const stepOptions = [
    { label: 'Under 3000', level: 1 },
    { label: '3000-5000', level: 2 },
    { label: '5000-8000', level: 3 },
    { label: '8000-10000', level: 4 },
    { label: '10000+', level: 5 },
  ];

  return (
    <div className="space-y-8 fade-in-up">
      <div>
        <p className="text-[#C8A951] text-xs tracking-widest uppercase mb-1">CURATION STEP 06</p>
        <h2 className="text-4xl font-display text-white leading-tight">How you</h2>
        <h2 className="text-4xl font-display text-[#C8A951] italic leading-tight">move.</h2>
        <div className="w-12 h-1 bg-[#C8A951] mt-2 rounded" />
      </div>

      <div className="space-y-3">
        <p className="text-white font-semibold">Average daily steps?</p>
        <div className="space-y-2">
          {stepOptions.map(opt => {
            const selected = data.dailySteps === opt.label;
            return (
              <button
                key={opt.label}
                onClick={() => update({ dailySteps: opt.label })}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                  selected ? 'bg-[#1a1a1a] border border-[#C8A951]' : 'bg-[#141414] border border-transparent'
                }`}
              >
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`h-3 flex-1 rounded-sm ${
                        i <= opt.level
                          ? selected ? 'bg-[#C8A951]' : 'bg-[#444]'
                          : 'bg-[#222]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white text-sm min-w-[100px] text-right">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-white font-semibold">What stops you from moving more?</p>
        <PillGroupMulti
          options={['No time', 'No energy', "Don't know what to do", 'Hate the gym', 'Physical limitations']}
          selected={data.movementBarriers}
          onToggle={v => {
            const next = data.movementBarriers.includes(v)
              ? data.movementBarriers.filter(x => x !== v)
              : [...data.movementBarriers, v];
            update({ movementBarriers: next });
          }}
        />
      </div>

      <div className="space-y-2">
        <p className="text-white font-semibold">Have you had a coach before?</p>
        <PillGroup
          options={['Never', "Yes but didn't work", 'Yes and it helped', 'Have one now']}
          selected={data.coachBefore}
          onSelect={v => update({ coachBefore: v })}
        />
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN 6B — EXTRA SCORING QUESTIONS
   ============================================================ */
function Screen6b({ data, update }: { data: UserData; update: (p: Partial<UserData>) => void }) {
  return (
    <div className="space-y-8 fade-in-up">
      <div>
        <p className="text-[#C8A951] text-xs tracking-widest uppercase mb-1">CURATION STEP 07</p>
        <h2 className="text-4xl font-display text-white leading-tight">Almost</h2>
        <h2 className="text-4xl font-display text-[#C8A951] italic leading-tight">there.</h2>
        <div className="w-12 h-1 bg-[#C8A951] mt-2 rounded" />
      </div>

      <Card label="READINESS">
        <SliderInput label="How ready are you to change? (1-10)" value={data.readiness} onChange={v => update({ readiness: v })} />
      </Card>

      <div className="space-y-2">
        <p className="text-white font-semibold">Who checks on your nutrition?</p>
        <PillGroup
          options={['Nobody', 'Doctor only', 'Friend/family', 'Coach/trainer']}
          selected={data.nutritionCheck}
          onSelect={v => update({ nutritionCheck: v })}
        />
      </div>

      <div className="space-y-2">
        <p className="text-white font-semibold">If you&apos;ve stopped a program before, why?</p>
        <PillGroup
          options={['Too restrictive', "Couldn't maintain", 'Too expensive', 'Life got in the way', 'Never tried one']}
          selected={data.whyStopped}
          onSelect={v => update({ whyStopped: v })}
        />
      </div>
    </div>
  );
}

/* ============================================================
   SCREEN 7 — RESULTS
   ============================================================ */
function Screen7({ data, scores, profile, showResults, downloadPDF }: {
  data: UserData; scores: Scores; profile: ProfileType; showResults: boolean; downloadPDF: () => void;
}) {
  const stuckItems = getStuckItems(data, scores);
  const morningProtein = getMorningProtein(profile);
  const stepSuggestion = getStepSuggestion(data);
  const actionItems = getActionItems(data, scores);
  const waterTarget = getWaterTarget(data);

  if (!showResults) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[#C8A951] text-xl font-display tracking-wider animate-pulse">
          Analyzing your results...
        </div>
      </div>
    );
  }

  const categories: { label: string; key: keyof Omit<Scores, 'total'> }[] = [
    { label: 'Blood Sugar', key: 'bloodSugar' },
    { label: 'Morning Protein', key: 'morningProtein' },
    { label: 'Hydration', key: 'hydration' },
    { label: 'Cortisol', key: 'eliminations' },
    { label: 'Movement', key: 'movement' },
    { label: 'Accountability', key: 'accountability' },
  ];

  return (
    <div className="space-y-10 fade-in-up pb-12">
      {/* Score Wheel */}
      <div className="flex flex-col items-center">
        <ScoreWheel score={scores.total} />
        <div className="text-xs text-[#888] mt-2 tracking-widest uppercase">METABOLIC SCORE</div>
      </div>

      {/* Category badges */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map(c => {
          const sc = getScoreColor(scores[c.key]);
          return (
            <div key={c.key} className="bg-[#141414] rounded-xl p-3 flex items-center justify-between">
              <span className="text-white text-xs">{c.label}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sc.hex }} />
                <span className="text-xs font-bold" style={{ color: sc.hex }}>{sc.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Profile Reveal */}
      <div className="text-center py-6">
        <p className="text-[#888] text-xs tracking-widest uppercase mb-3">METABOLIC ARCHETYPE</p>
        <h2 className="text-white text-2xl font-display mb-1">You are...</h2>
        <h2 className="text-[#C8A951] text-5xl font-display leading-tight">{profileNames[profile]}</h2>
        <p className="text-white/80 text-sm mt-4 leading-relaxed max-w-sm mx-auto">{profileDescriptions[profile]}</p>
      </div>

      {/* What's Keeping You Stuck — compact pill cards */}
      {stuckItems.length > 0 && (
        <div className="bg-[#141414] rounded-2xl p-6 space-y-4">
          <h3 className="text-[#C8A951] font-display text-2xl flex items-center gap-2">
            <span className="text-sm">🔒</span> What&apos;s Keeping You Stuck
          </h3>
          {stuckItems.map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-[#C8A951] font-display text-lg min-w-[24px] mt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <p className="text-white font-bold text-sm">{item.title}</p>
                <p className="text-white/60 text-xs leading-relaxed mt-0.5">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Phase 1 Plan */}
      <div>
        <p className="text-[#888] text-xs tracking-widest uppercase mb-4">YOUR PHASE 1 PLAN</p>

        {/* Morning Protocol — pill style */}
        <div className="bg-[#141414] rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-[#C8A951]/20">
              <span className="text-base">🍳</span>
            </div>
            <div>
              <p className="text-[#888] text-[10px] tracking-widest uppercase">MORNING PROTOCOL</p>
              <p className="text-white font-bold text-sm">30g Protein Before 9AM</p>
              <p className="text-[#C8A951] text-xs">Under 400 cal.</p>
            </div>
          </div>
          <p className="text-white/60 text-xs leading-relaxed">{morningProtein}</p>
        </div>

        {/* Dining Out — with restaurant cards inside */}
        <div className="bg-[#141414] rounded-2xl p-5 mb-4">
          <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">Dining Out 🍽</h4>
          <p className="text-white/50 text-xs mb-3">The Golden Rule: Order double greens before any carbohydrate touches your plate.</p>
          {data.restaurants.length > 0 && (
            <div className="space-y-2">
              {data.restaurants.map(r => {
                const order = restaurantOrders[r];
                if (!order) return null;
                return (
                  <div key={r} className="bg-[#0a0a0a] rounded-xl p-3 flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="text-[#C8A951] font-bold text-xs">{order.name}</h5>
                      <p className="text-white/60 text-[11px] leading-relaxed mt-0.5">{order.order}</p>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-[#C8A951] text-xs font-bold">{order.calories} cal</p>
                      <p className="text-white/50 text-[10px]">{order.protein}g protein</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rescue Snack */}
        <div className="bg-[#141414] rounded-xl p-4 mb-4">
          <h4 className="text-white font-bold text-sm mb-1">Rescue Snack 🚨</h4>
          <p className="text-white/60 text-xs leading-relaxed">Raw walnuts + a pinch of sea salt. Blocks the 3 PM cortisol spike.</p>
        </div>

        {/* Step + Water row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#141414] rounded-xl p-4">
            <h4 className="text-[#C8A951] font-bold text-xs mb-1">Step Target</h4>
            <p className="text-white font-display text-lg">7,000/day</p>
            <p className="text-white/50 text-[11px] leading-relaxed mt-1">{stepSuggestion}</p>
          </div>
          <div className="bg-[#141414] rounded-xl p-4">
            <h4 className="text-[#C8A951] font-bold text-xs mb-1">Daily Water</h4>
            <p className="text-white font-display text-lg">{waterTarget}</p>
            <p className="text-white/50 text-[11px] leading-relaxed mt-1">Carry a 32oz bottle. Fill it twice minimum.</p>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="space-y-3">
        <h3 className="text-[#C8A951] font-display text-xl">Your 3 Action Items</h3>
        {actionItems.map((item, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full border-2 border-[#C8A951] flex items-center justify-center shrink-0">
              <span className="text-[#C8A951] text-sm font-bold">{i + 1}</span>
            </div>
            <p className="text-white/80 text-sm leading-relaxed pt-1">{item}</p>
          </div>
        ))}
      </div>

      {/* Download / Email Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={downloadPDF}
          className="w-full py-4 bg-[#141414] border border-[#C8A951]/30 rounded-full text-white font-bold text-sm tracking-wider hover:bg-[#1a1a1a] transition-all"
        >
          DOWNLOAD YOUR REPORT
        </button>
        <button className="w-full py-4 bg-[#C8A951] rounded-full text-black font-bold text-sm tracking-wider hover:bg-[#d4b85e] transition-all pulse-gold">
          EMAIL MY RESULTS
        </button>
      </div>

      {/* Community CTA */}
      <div className="bg-[#141414] border border-[#C8A951]/20 rounded-2xl p-6 text-center">
        <p className="text-white font-bold mb-1">RIVEN Community — $100/month</p>
        <p className="text-white/60 text-xs mb-3">Weekly coaching calls. Daily step accountability. Restaurant guides.</p>
        <p className="text-[#C8A951] text-xs mb-4">7-day free trial. Cancel anytime.</p>
        <a
          href="https://www.skool.com/riven-community-5552/about"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-10 py-3 bg-[#C8A951] rounded-full text-black font-bold text-sm tracking-wider hover:bg-[#d4b85e] transition-all"
        >
          JOIN RIVEN →
        </a>
      </div>

      {/* Back / Next nav on results */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-[#888] flex items-center gap-2 text-sm">
          ← BACK
        </button>
        <a
          href="https://www.skool.com/riven-community-5552/about"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-3 bg-[#C8A951] rounded-full text-black font-bold text-sm tracking-wider"
        >
          NEXT →
        </a>
      </div>
    </div>
  );
}

/* ============================================================
   SHARED COMPONENTS
   ============================================================ */

function Card({ label, children, gold }: { label: string; children: React.ReactNode; gold?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${gold ? 'bg-[#1a1a0f] border border-[#C8A951]/20' : 'bg-[#141414]'}`}>
      <h3 className="text-[#C8A951] font-display text-sm tracking-wider mb-4">{label}</h3>
      {children}
    </div>
  );
}

function NumberPicker({ label, value, onChange, min, max, step = 1, display }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; display?: string;
}) {
  return (
    <div className="text-center">
      <div className="text-[#888] text-[10px] tracking-widest uppercase mb-2">{label}</div>
      <div className="flex items-center justify-center bg-[#1a1a1a] rounded-full px-2 py-2">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 rounded-full text-[#C8A951] text-lg font-bold flex items-center justify-center hover:bg-[#222] transition-colors"
        >
          &minus;
        </button>
        <span className="text-[#C8A951] font-display text-2xl min-w-[60px] text-center">{display ?? value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-8 h-8 rounded-full text-[#C8A951] text-lg font-bold flex items-center justify-center hover:bg-[#222] transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

function PillGroup({ options, selected, onSelect }: {
  options: string[]; selected: string; onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`px-4 py-3 rounded-full text-sm transition-all ${
            selected === opt
              ? 'bg-[#C8A951] text-black font-bold'
              : 'bg-[#141414] text-white/80 border border-white/10'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function PillGroupMulti({ options, selected, onToggle }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onToggle(opt)}
          className={`px-4 py-3 rounded-full text-sm transition-all flex items-center gap-2 ${
            selected.includes(opt)
              ? 'bg-[#C8A951] text-black font-bold'
              : 'bg-[#141414] text-white/80 border border-white/10'
          }`}
        >
          {opt}
          {selected.includes(opt) && <span className="text-xs">✓</span>}
        </button>
      ))}
    </div>
  );
}

function SliderInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-white/70 text-sm">{label}</span>
        <span className="text-[#C8A951] font-display text-3xl">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        style={{
          background: `linear-gradient(to right, #C8A951 0%, #C8A951 ${(value - 1) * 11.11}%, #333 ${(value - 1) * 11.11}%, #333 100%)`
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[#555] text-[10px]">1</span>
        <span className="text-[#555] text-[10px]">10</span>
      </div>
    </div>
  );
}

function StepLabel({ num, text }: { num: string; text: string }) {
  return (
    <div className="flex items-center gap-3 mb-2">
      <span className="text-[#C8A951] font-display text-lg border border-[#C8A951]/30 rounded-full w-8 h-8 flex items-center justify-center text-sm">{num}</span>
      <span className="text-white font-semibold text-sm">{text}</span>
    </div>
  );
}

function HeightPicker({ ft, inches, onChangeFt, onChangeIn }: {
  ft: number; inches: number; onChangeFt: (v: number) => void; onChangeIn: (v: number) => void;
}) {
  const decrement = () => {
    if (inches > 0) { onChangeIn(inches - 1); }
    else if (ft > 4) { onChangeFt(ft - 1); onChangeIn(11); }
  };
  const increment = () => {
    if (inches < 11) { onChangeIn(inches + 1); }
    else if (ft < 7) { onChangeFt(ft + 1); onChangeIn(0); }
  };
  return (
    <div className="text-center">
      <div className="text-[#888] text-[10px] tracking-widest uppercase mb-2">HEIGHT</div>
      <div className="flex items-center justify-center bg-[#1a1a1a] rounded-full px-2 py-2">
        <button onClick={decrement} className="w-8 h-8 rounded-full text-[#C8A951] text-lg font-bold flex items-center justify-center hover:bg-[#222] transition-colors">&minus;</button>
        <span className="text-[#C8A951] font-display text-2xl min-w-[60px] text-center">{ft}&apos;{inches}&quot;</span>
        <button onClick={increment} className="w-8 h-8 rounded-full text-[#C8A951] text-lg font-bold flex items-center justify-center hover:bg-[#222] transition-colors">+</button>
      </div>
    </div>
  );
}

function ScoreWheel({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const percentage = score / 60;
  const offset = circumference * (1 - percentage);

  // Gradient stop: red -> yellow -> green
  const strokeColor = score <= 20 ? '#E74C3C' : score <= 35 ? '#F1C40F' : score <= 50 ? '#8BC34A' : '#2ECC71';

  return (
    <div className="relative w-48 h-48">
      <svg width="192" height="192" viewBox="0 0 192 192" className="transform -rotate-90">
        <circle cx="96" cy="96" r={radius} fill="none" stroke="#222" strokeWidth="12" />
        <circle
          cx="96" cy="96" r={radius} fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E74C3C" />
            <stop offset="50%" stopColor="#F1C40F" />
            <stop offset="100%" stopColor="#2ECC71" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div>
          <span className="text-white font-display text-5xl">{score}</span>
          <span className="text-[#888] font-display text-2xl">/60</span>
        </div>
      </div>
    </div>
  );
}
