import { useState, useEffect } from 'react';
import { Clock, Users, BookOpen, Brain, ChevronDown } from 'lucide-react';

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(7);
  const [loading, setLoading] = useState(true);
  
  // Fake data for UI structure since we don't have the actual DB schemas
  const [metrics, setMetrics] = useState({
    totalStudyMinutes: 0,
    questionsAnswered: 0,
    mockTestsCompleted: 0,
    newUsers: 0
  });

  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  const [examDist, setExamDist] = useState<{name: string, value: number}[]>([]);
  const [topSubjects, setTopSubjects] = useState<{name: string, attempts: number, max: number}[]>([]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // In a real scenario, we'd query Supabase:
      // const rangeStart = new Date();
      // rangeStart.setDate(rangeStart.getDate() - dateRange);
      // const { data } = await supabase.from('...').select('...').gte('activity_date', rangeStart.toISOString());
      
      // Simulating data loading
      setTimeout(() => {
        setMetrics({
          totalStudyMinutes: Math.floor(Math.random() * 100000) + 10000,
          questionsAnswered: Math.floor(Math.random() * 50000) + 5000,
          mockTestsCompleted: Math.floor(Math.random() * 1000) + 100,
          newUsers: Math.floor(Math.random() * 500) + 50
        });

        // 7 days x 24 hours fake heatmap
        const hm = Array.from({ length: 7 }, () => 
          Array.from({ length: 24 }, () => Math.random())
        );
        setHeatmapData(hm);

        setExamDist([
          { name: 'GATE', value: 45 },
          { name: 'JEE', value: 30 },
          { name: 'NEET', value: 15 },
          { name: 'CUET', value: 5 },
          { name: 'Other', value: 5 },
        ]);

        setTopSubjects([
          { name: 'Data Structures', attempts: 4500, max: 5000 },
          { name: 'Algorithms', attempts: 3800, max: 5000 },
          { name: 'Physics', attempts: 2100, max: 5000 },
          { name: 'Organic Chemistry', attempts: 1800, max: 5000 },
          { name: 'Mathematics', attempts: 1500, max: 5000 },
        ]);

        setLoading(false);
      }, 800);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen bg-[#062B3D] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Platform Analytics</h1>
            <p className="text-white/60 mt-1">Monitor student engagement and platform usage</p>
          </div>
          <div className="relative inline-block">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value) as any)}
              className="appearance-none bg-white/5 border border-white/10 text-white px-4 py-2.5 pr-10 rounded-xl outline-none font-semibold cursor-pointer hover:bg-white/10 transition-colors"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
            <ChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#5CE1E6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard 
                icon={<Clock className="w-6 h-6 text-[#5CE1E6]" />}
                title="Total Study Minutes"
                value={metrics.totalStudyMinutes.toLocaleString()}
                trend="+12%"
              />
              <MetricCard 
                icon={<Brain className="w-6 h-6 text-purple-400" />}
                title="Questions Answered"
                value={metrics.questionsAnswered.toLocaleString()}
                trend="+8%"
              />
              <MetricCard 
                icon={<BookOpen className="w-6 h-6 text-green-400" />}
                title="Mock Tests Taken"
                value={metrics.mockTestsCompleted.toLocaleString()}
                trend="+24%"
              />
              <MetricCard 
                icon={<Users className="w-6 h-6 text-pink-400" />}
                title="New Users"
                value={metrics.newUsers.toLocaleString()}
                trend="-3%"
                negative
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Heatmap */}
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Activity Heatmap</h3>
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div className="flex mb-2 text-xs text-white/40 font-semibold pl-12">
                      {[0,4,8,12,16,20].map(h => (
                        <div key={h} className="flex-1">{h}:00</div>
                      ))}
                    </div>
                    {heatmapData.map((dayData, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <div className="w-10 text-xs text-white/40 font-semibold">{days[i]}</div>
                        <div className="flex flex-1 gap-1">
                          {dayData.map((val, j) => (
                            <div 
                              key={j} 
                              className="flex-1 aspect-square rounded-sm bg-[#5CE1E6] transition-opacity hover:opacity-100 cursor-pointer"
                              style={{ opacity: Math.max(0.1, val * 0.9) }}
                              title={`${days[i]} ${j}:00 - Intensity: ${Math.round(val*100)}%`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exam Distribution */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Exam Distribution</h3>
                <div className="space-y-4">
                  {examDist.map(exam => (
                    <div key={exam.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-white/80">{exam.name}</span>
                        <span className="font-bold text-[#5CE1E6]">{exam.value}%</span>
                      </div>
                      <div className="w-full bg-[#04202E] rounded-full h-2.5">
                        <div className="bg-[#5CE1E6] h-2.5 rounded-full" style={{ width: `${exam.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Subjects */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6">Top Subjects (Questions Attempted)</h3>
                <div className="space-y-6">
                  {topSubjects.map((sub, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 text-center font-bold text-white/40">#{i+1}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-semibold">{sub.name}</span>
                          <span className="text-white/60">{sub.attempts.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-[#04202E] rounded-full h-1.5">
                          <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${(sub.attempts/sub.max)*100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Usage Trend */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                <h3 className="text-xl font-bold mb-2">AI Usage Trend</h3>
                <p className="text-white/50 text-sm mb-6">Number of AI queries per day</p>
                <div className="flex-1 flex items-end gap-2 pt-10 pb-2 border-b border-white/10">
                  {Array.from({length: 30}).map((_, i) => {
                    const height = Math.random() * 100;
                    return (
                      <div key={i} className="flex-1 relative group h-full flex items-end">
                        <div 
                          className="w-full bg-[#5CE1E6]/40 hover:bg-[#5CE1E6] rounded-t-sm transition-all"
                          style={{ height: `${height}%` }}
                        />
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-[#062B3D] text-xs font-bold py-1 px-2 rounded pointer-events-none z-10 transition-opacity">
                          {Math.round(height * 10)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, trend, negative = false }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/5 rounded-xl">
          {icon}
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${negative ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-400'}`}>
          {trend}
        </div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm font-semibold text-white/50">{title}</div>
    </div>
  );
}
