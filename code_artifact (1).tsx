import React, { useState } from 'react';
import { 
  Utensils, 
  Calendar, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Palette,
  ChefHat,
  ArrowLeft,
  Printer
} from 'lucide-react';

export default function App() {
  // --- すてーと かんり ---
  const [activeStep, setActiveStep] = useState('input'); // 'input' | 'result'
  
  // にゅうりょく ふぉーむ すてーと（デフォルト値もひらがな）
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [title, setTitle] = useState('みんな だいすき かれーらいす');
  const [mainDish, setMainDish] = useState('ぽーくかれー (むぎごはん)');
  const [sideDish, setSideDish] = useState('かいそうと つなの さらだ');
  const [soup, setSoup] = useState('');
  const [dessert, setDessert] = useState('りんご');
  const [drink, setDrink] = useState('ぎゅうにゅう');
  const [artStyle, setArtStyle] = useState('picturebook');

  // せいせい けっか すてーと
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState([]);

  // いらすと すたいるの ていぎ
  const artStyles = [
    { id: 'picturebook', name: 'えほんふう（あたたかい てがきの たっち）', promptStyle: 'cute picture book illustration style, warm soft hand-drawn lines, whimsical' },
    { id: 'watercolor', name: 'すいさいがふう（やさしい ぱすてるちょう）', promptStyle: 'soft pastel watercolor illustration, gentle textures, cheerful colors' },
    { id: '3d', name: 'くれい・3Dふう（ぽっぷな りったいかん）', promptStyle: 'cute 3D claymation style, vibrant, smooth, soft lighting' },
    { id: 'pop', name: 'ぽっぷ あにめふう（はっきりした いらすと）', promptStyle: 'bright pop anime style, clean lines, colorful, vector graphic feel' }
  ];

  // ぷろんぷと せいせい へるぱー
  const buildPrompt = () => {
    const items = [mainDish, sideDish, soup, dessert, drink].filter(item => item.trim() !== '');
    const selectedStyle = artStyles.find(s => s.id === artStyle)?.promptStyle || artStyles[0].promptStyle;
    
    return `A cute Japanese elementary school lunch tray (Kyushoku) layout containing: ${items.join(', ')}. ${selectedStyle}, top-down isometric view, clean background, bright appetite-inducing visual for kids, high resolution.`;
  };

  // Gemini 3.1 Flash Image APIを つかった がぞう せいせい
  const callGenerateApi = async (promptText) => {
    const apiKey = ""; // じっこう きょうきょうから じどう ていきょう されます
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        role: 'user',
        parts: [{ text: promptText }]
      }],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: { aspectRatio: "1:1" }
      }
    };

    const delays = [1000, 2000, 4000, 8000, 16000];
    let response;

    for (let i = 0; i <= delays.length; i++) {
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });
        if (response.ok) break;
      } catch (err) {
        if (i === delays.length) throw err;
      }
      if (i < delays.length) {
        await new Promise(r => setTimeout(r, delays[i]));
      }
    }

    if (!response || !response.ok) {
      throw new Error('がぞうの せいせい りくえすとに しっぱい しました。じかんを おいて さいちこう してください。');
    }

    const data = await response.json();
    const part = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part || !part.inlineData?.data) {
      throw new Error('がぞう でーたの しゅとくに しっぱい しました。');
    }

    return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
  };

  // いらすと せいせい しょり はんどらー
  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg('');
    setActiveStep('result');

    const prompt = buildPrompt();
    setCustomPrompt(prompt);

    try {
      const imgUrl = await callGenerateApi(prompt);
      setGeneratedImageUrl(imgUrl);
      
      // りれきに ついか
      const newHistoryItem = {
        id: Date.now(),
        date,
        title,
        imgUrl,
        items: [mainDish, sideDish, soup, dessert, drink].filter(Boolean)
      };
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 5)]);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'いらすとの せいせいちゅうに えらーが はっせい しました。');
    } finally {
      setIsGenerating(false);
    }
  };

  // さいせいせい
  const handleRegenerate = async () => {
    if (!customPrompt) return;
    setIsGenerating(true);
    setErrorMsg('');

    try {
      const imgUrl = await callGenerateApi(customPrompt);
      setGeneratedImageUrl(imgUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg('さいせいせいに しっぱい しました: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // がぞう だうんろーど
  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImageUrl;
    link.download = `kyushoku-menu-${date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // いんさつ
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-amber-50/50 text-slate-800 font-sans pb-12">
      {}
      {/* へっだー */}
      <header className="bg-white border-b border-amber-200 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-amber-500 text-white p-2 rounded-xl shadow-sm">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-900 tracking-tight">きゅうしょく こんだて いらすと めーかー</h1>
              <p className="text-xs text-amber-700">こんだてを にゅうりょく するだけで かわいい いらすとを AIが じどう さくせい</p>
            </div>
          </div>

          {/* すてっぷ なびげーしょん */}
          <div className="flex items-center space-x-2 bg-amber-100/60 p-1 rounded-lg">
            <button
              onClick={() => setActiveStep('input')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1 ${
                activeStep === 'input' 
                  ? 'bg-white text-amber-900 shadow-sm' 
                  : 'text-amber-700 hover:text-amber-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1. こんだて にゅうりょく</span>
            </button>
            <button
              onClick={() => {
                if (generatedImageUrl || isGenerating) setActiveStep('result');
              }}
              disabled={!generatedImageUrl && !isGenerating}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center space-x-1 ${
                activeStep === 'result' 
                  ? 'bg-white text-amber-900 shadow-sm' 
                  : 'text-amber-700 hover:text-amber-900 disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>2. いらすと かくにん・こうせい</span>
            </button>
          </div>
        </div>
      </header>

      {/* めいん こんてんつ えりあ */}
      <main className="max-w-5xl mx-auto px-4 pt-6">
        {}
        {/* ================= STEP 1: にゅうりょく がめん ================= */}
        {activeStep === 'input' && (
          <div className="space-y-6 animate-fadeIn">
            {/* どうにゅう かーど */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="relative z-10 max-w-xl">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-semibold mb-2 backdrop-blur-sm">
                  がっこう きゅうしょく・ほいくえん・ようちえんの けいじぶつに
                </span>
                <h2 className="text-2xl font-bold mb-2">きょうの こんだてから いらすとを つくりましょう</h2>
                <p className="text-sm text-amber-50">
                  ひづけと こんだて めにゅーを にゅうりょく するだけで、こんだて ぜんたいが ならんだ おいしそうな きゅうしょくの いらすとを AIが じどうで つくります。
                </p>
              </div>
              <ChefHat className="absolute -right-4 -bottom-4 w-40 h-40 text-white/10 rotate-12 pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* にゅうりょく ふぉーむ (ひだりがわ 2からむ) */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-amber-100 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-amber-500" />
                    <span>こんだて じょうほうの せってい</span>
                  </h3>
                  <span className="text-xs text-slate-400">*ひっす こうもく</span>
                </div>

                {/* ひづけ & たいとる */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">きゅうしょくの ひづけ *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">こんだて たいとる・てーま</label>
                    <input
                      type="text"
                      placeholder="れい: ぎょうじしょく「たなばた めにゅー」"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                {/* めにゅー じょうほうの にゅうりょく */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">めにゅーの うちわけ</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">しゅしょく (ごはん・ぱん・めん など)</label>
                      <input
                        type="text"
                        placeholder="れい: ごはん、こっぺぱん"
                        value={mainDish}
                        onChange={(e) => setMainDish(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">しゅさい (にく・さかな などの めいん)</label>
                      <input
                        type="text"
                        placeholder="れい: はんばーぐ、さけの しおやき"
                        value={sideDish}
                        onChange={(e) => setSideDish(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">ふくさい・さらだ</label>
                      <input
                        type="text"
                        placeholder="れい: ぽてとさらだ、ひじきの にもの"
                        value={soup}
                        onChange={(e) => setSoup(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">しるもの・すーぷ</label>
                      <input
                        type="text"
                        placeholder="れい: わかめすーぷ、とんじる"
                        value={dessert}
                        onChange={(e) => setDessert(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">でざーと・くだもの・のみもの</label>
                        <input
                          type="text"
                          placeholder="れい: みかん、よーぐると、ぎゅうにゅう"
                          value={drink}
                          onChange={(e) => setDrink(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* たっち・がふう せんたく */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center space-x-1">
                    <Palette className="w-4 h-4 text-amber-500" />
                    <span>いらすと の たっちを えらぶ</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {artStyles.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setArtStyle(style.id)}
                        className={`p-3 text-left rounded-xl border transition-all text-xs flex items-start space-x-2 ${
                          artStyle === style.id
                            ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 font-medium text-amber-900'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full mt-0.5 border flex items-center justify-center ${
                          artStyle === style.id ? 'border-amber-500 bg-amber-500' : 'border-slate-300'
                        }`}>
                          {artStyle === style.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="font-semibold">{style.name.split('（')[0]}</p>
                          <p className="text-[11px] text-slate-500">（{style.name.split('（')[1]}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* そうしん ぼたん */}
                <div className="pt-4">
                  <button
                    onClick={handleGenerate}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all transform active:scale-[0.99] flex items-center justify-center space-x-2 text-base"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>この こんだてで いらすとを つくる</span>
                  </button>
                </div>
              </div>

              {}
              {/* みぎがわ：がいど & りれき */}
              <div className="space-y-6">
                {/* がいど */}
                <div className="bg-amber-100/50 border border-amber-200/60 rounded-2xl p-5">
                  <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>つくるときの ひんと</span>
                  </h4>
                  <ul className="text-xs text-amber-800/90 space-y-2 list-disc list-inside leading-relaxed">
                    <li>こんだてめいは ぐたいてきに にゅうりょく すると、より とくちょうを つかんだ いらすとが つくられます。</li>
                    <li>「かれーらいす」「はんばーぐ」など いろどりの ある めにゅーを いれるのが おすすめです。</li>
                    <li>つくった あとでも こうせいがめん で ぷろんぷとを ちょうせい して もういちど つくれます。</li>
                  </ul>
                </div>

                {/* さいきん つくった こんだて */}
                {history.length > 0 && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h4 className="font-bold text-slate-800 text-sm mb-3">さいきん つくった いらすと</h4>
                    <div className="space-y-3">
                      {history.map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => {
                            setDate(item.date);
                            setTitle(item.title);
                            setGeneratedImageUrl(item.imgUrl);
                            setActiveStep('result');
                          }}
                          className="flex items-center space-x-3 p-2 rounded-xl border border-slate-100 hover:bg-amber-50/50 cursor-pointer transition-all"
                        >
                          <img 
                            src={item.imgUrl} 
                            alt={item.title} 
                            className="w-12 h-12 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-400">{item.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {}
        {/* ================= STEP 2: さくせい・こうせい かくにん がめん ================= */}
        {activeStep === 'result' && (
          <div className="space-y-6 animate-fadeIn">
            {/* じょうぶ あくしょんばー */}
            <div className="flex items-center justify-between print:hidden">
              <button
                onClick={() => setActiveStep('input')}
                className="flex items-center space-x-1 text-sm font-semibold text-amber-700 hover:text-amber-900 bg-white px-4 py-2 rounded-xl border border-amber-200/60 shadow-sm transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>こんだての にゅうりょく がめんに もどる</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  disabled={isGenerating || !generatedImageUrl}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>きゅうしょく かーど として いんさつ</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={isGenerating || !generatedImageUrl}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>がぞうを ほぞん</span>
                </button>
              </div>
            </div>

            {/* えらー めっせーじ ひょうじ */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center space-x-2 print:hidden">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* きゅうしょくだよりふう れいあうと かーど */}
            <div className="bg-white rounded-2xl border-2 border-amber-200/80 p-6 md:p-8 shadow-lg print:shadow-none print:border-none print:p-0">
              
              {/* かーど へっだー */}
              <div className="border-b-2 border-dashed border-amber-300 pb-4 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-2">
                <div>
                  <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full mb-2">
                    {date ? new Date(date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }) : 'ひづけ みてい'} の きゅうしょく
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                    {title || 'ほんじつの こんだて'}
                  </h2>
                </div>
                <div className="text-xs text-amber-700 font-medium">
                  しょくいくだより / きゅうしょく こーなー けいじよう
                </div>
              </div>

              {/* めいん こんてんつ: いらすと + めにゅー りすと */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* ひだりがわ: せいせいされた いらすと ひょうじ えりあ */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-amber-50/50 border border-amber-100 flex items-center justify-center group shadow-inner">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                        <ChefHat className="w-8 h-8 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-base">いらすとを つくっています...</p>
                        <p className="text-xs text-slate-400 mt-1">AIが おいしい こんだてを えがいています（やく5〜10びょう）</p>
                      </div>
                    </div>
                  ) : generatedImageUrl ? (
                    <>
                      <img 
                        src={generatedImageUrl} 
                        alt="せいせいされた きゅうしょく いらすと" 
                        className="w-full h-full object-cover rounded-xl transition-all"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 print:hidden">
                        <button 
                          onClick={handleDownload}
                          className="p-3 bg-white text-slate-800 rounded-full shadow-lg hover:scale-110 transition-transform"
                          title="がぞうを ほぞん"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 text-slate-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">いらすとが ありません</p>
                    </div>
                  )}
                </div>

                {/* みぎがわ: こんだて おしながき */}
                <div className="space-y-6">
                  <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-100">
                    <h3 className="text-sm font-bold text-amber-900 border-b border-amber-200/80 pb-2 mb-4 flex items-center space-x-2">
                      <Utensils className="w-4 h-4 text-amber-600" />
                      <span>こんだて めにゅー</span>
                    </h3>
                    
                    <ul className="space-y-3">
                      {[
                        { label: 'しゅしょく', value: mainDish },
                        { label: 'しゅさい', value: sideDish },
                        { label: 'ふくさい', value: soup },
                        { label: 'しるもの', value: dessert },
                        { label: 'でざーと・のみもの', value: drink },
                      ].filter(item => item.value).map((item, idx) => (
                        <li key={idx} className="flex items-start justify-between text-sm border-b border-amber-100/60 pb-2 last:border-none">
                          <span className="text-xs font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                            {item.label}
                          </span>
                          <span className="font-bold text-slate-800 text-right ml-4">
                            {item.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* きゅうしょく わんぽいんと あどばいす */}
                  <div className="border border-dashed border-amber-300 rounded-xl p-4 bg-white">
                    <h4 className="text-xs font-bold text-amber-800 mb-1 flex items-center space-x-1">
                      <span>💡 きょうの えいよう ぽいんと</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      しっかり たべて、げんきに すごしましょう！ のこさず たべることで ばらんすよく えいようを とることができます。
                    </p>
                  </div>
                </div>
              </div>

              {/* かーど ふったー */}
              <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400 print:block hidden">
                きゅうしょく こんだて いらすと めーかー で つくりました
              </div>
            </div>

            {}
            {/* かぶ: ぷろんぷと ちょうせい (いんさつじは ひひょうじ) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 print:hidden">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>いらすと こうせい ぷろんぷとの ちょうせい</span>
                </h3>
                <span className="text-xs text-slate-400">いめーじと ちがう ばあいは ぷろんぷとを へんこう して もういちど つくれます</span>
              </div>

              <div className="flex gap-2">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="AIへの しじ ぷろんぷと"
                  rows={2}
                  className="flex-1 p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono text-slate-600 bg-slate-50"
                />
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="px-5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center space-x-1.5 flex-shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>もういちど つくる</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}