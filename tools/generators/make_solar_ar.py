import json, os
AR = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")
def n(i): return str(i).translate(AR)
def pg(body, num, cls=""):
    return '<div class="pg %s">%s<div class="pgnum">%s</div></div>' % (cls, body, n(num))
def term(w, d): return '<span class="term" data-def="%s">%s</span>' % (d, w)
def dlg(who, line): return '<p class="dlg"><b>%s</b>«%s»</p>' % (who, line)

DEFS = '''<defs>
<radialGradient id="gSun" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#fff6c2"/><stop offset=".45" stop-color="#ffc93c"/><stop offset="1" stop-color="#ff7b1c"/></radialGradient>
<radialGradient id="gEarth" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#7fd0ff"/><stop offset=".6" stop-color="#1f6fd1"/><stop offset="1" stop-color="#0b2f6b"/></radialGradient>
<radialGradient id="gJup" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#f4dcb8"/><stop offset="1" stop-color="#b9824f"/></radialGradient>
<radialGradient id="gShade" cx="30%" cy="30%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
</defs>'''

SUN = '''<svg class="fig" viewBox="0 0 400 210" role="img" aria-label="الشمس">%s
<rect width="400" height="210" rx="16" fill="#0d0a24"/>
<g fill="#fff" opacity=".7"><circle cx="30" cy="30" r="1.2"/><circle cx="360" cy="40" r="1"/><circle cx="320" cy="180" r="1.4"/><circle cx="60" cy="170" r="1"/><circle cx="110" cy="60" r=".8"/><circle cx="290" cy="90" r=".9"/></g>
<circle cx="200" cy="105" r="78" fill="#ffb02e" opacity=".55" filter="url(#glow)"/>
<circle cx="200" cy="105" r="70" fill="url(#gSun)"/>
<circle cx="175" cy="85" r="9" fill="#ff9a1f" opacity=".5"/><circle cx="228" cy="128" r="6" fill="#ff9a1f" opacity=".45"/>
<circle cx="345" cy="105" r="3.2" fill="url(#gEarth)"/><text x="345" y="125" fill="#cfe3ff" font-size="11" text-anchor="middle" font-family="Cairo">الأرض</text>
<text x="200" y="200" fill="#ffd98a" font-size="11" text-anchor="middle" font-family="Cairo">الشمس عرضها حوالي ١٠٩ مرة قد الأرض</text>
</svg>''' % DEFS

PLANETS = [("عطارد",36,3,"#b5aca0"),("الزهرة",52,5,"#e8c27a"),("الأرض",70,5.4,"url(#gEarth)"),("المريخ",88,4,"#d2603a"),
           ("المشتري",116,11,"url(#gJup)"),("زحل",146,9.5,"#e3c98d"),("أورانوس",170,7,"#9fe3e8"),("نبتون",192,7,"#4e7cf0")]
import math
def orbits():
    s = ['<svg class="fig" viewBox="0 0 400 226" role="img" aria-label="مدارات الكواكب حول الشمس">' + DEFS,
         '<rect width="400" height="226" rx="16" fill="#0d0a24"/>',
         '<circle cx="200" cy="113" r="22" fill="#ffb02e" opacity=".5" filter="url(#glow)"/><circle cx="200" cy="113" r="18" fill="url(#gSun)"/>']
    for i,(name,r,size,col) in enumerate(PLANETS):
        s.append('<ellipse cx="200" cy="113" rx="%d" ry="%d" fill="none" stroke="#8f86c9" stroke-opacity=".35" stroke-width="1"/>' % (r, r*0.47))
        a = math.radians(200 + i*41)
        x, y = 200 + r*math.cos(a), 113 + r*0.47*math.sin(a)
        if name == "زحل":
            s.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" stroke="#d9c08a" stroke-width="2"/>' % (x,y,size*1.8,size*0.55))
        s.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s"/>' % (x,y,size,col))
        ty = y - size - 4 if y < 113 else y + size + 11
        s.append('<text x="%.1f" y="%.1f" fill="#e6e1ff" font-size="9.5" text-anchor="middle" font-family="Cairo">%s</text>' % (x,ty,name))
    s.append('</svg>')
    return "".join(s)

def sizes(items, h=150, label=""):
    total = sum(2*r for _,r,_ in items) + 14*(len(items)+1)
    x = total - 14   # draw right-to-left so the reading order matches Arabic
    out = ['<svg class="fig" viewBox="0 0 %d %d" role="img" aria-label="%s">' % (total, h, label) + DEFS,
           '<rect width="%d" height="%d" rx="14" fill="#0d0a24"/>' % (total, h)]
    cy = h/2 - 6
    for name, r, col in items:
        cx = x - r
        if name == "زحل":
            out.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="none" stroke="#d9c08a" stroke-width="3"/>' % (cx,cy,r*1.55,r*0.42))
        out.append('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="%s"/><circle cx="%.1f" cy="%.1f" r="%.1f" fill="url(#gShade)"/>' % (cx,cy,r,col,cx,cy,r))
        if name == "المشتري":
            out.append('<ellipse cx="%.1f" cy="%.1f" rx="%.1f" ry="%.1f" fill="#c0533a" opacity=".8"/>' % (cx+r*.3,cy+r*.3,r*.22,r*.12))
        out.append('<text x="%.1f" y="%d" fill="#e6e1ff" font-size="11" text-anchor="middle" font-family="Cairo">%s</text>' % (cx, h-8, name))
        x -= 2*r + 14
    out.append('</svg>')
    return "".join(out)

ROCKY = sizes([("عطارد",12,"#b5aca0"),("الزهرة",30,"#e8c27a"),("الأرض",32,"url(#gEarth)"),("المريخ",17,"#d2603a")], 110, "أحجام الكواكب الصخرية")
GIANTS = sizes([("المشتري",56,"url(#gJup)"),("زحل",47,"#e3c98d"),("أورانوس",20,"#9fe3e8"),("نبتون",19,"#4e7cf0"),("الأرض",5,"url(#gEarth)")], 160, "أحجام الكواكب العملاقة مقارنة بالأرض")

DAYNIGHT = '''<svg class="fig" viewBox="0 0 400 190" role="img" aria-label="الليل والنهار">%s
<rect width="400" height="190" rx="16" fill="#0d0a24"/>
<circle cx="-10" cy="95" r="70" fill="#ffb02e" opacity=".45" filter="url(#glow)"/><circle cx="-10" cy="95" r="60" fill="url(#gSun)"/>
<g stroke="#ffd98a" stroke-width="2" stroke-dasharray="4 6" opacity=".7"><line x1="60" y1="60" x2="200" y2="60"/><line x1="60" y1="95" x2="200" y2="95"/><line x1="60" y1="130" x2="200" y2="130"/></g>
<g transform="rotate(-23.5 270 95)"><circle cx="270" cy="95" r="58" fill="url(#gEarth)"/>
<path d="M270 37 A58 58 0 0 1 270 153 Z" fill="#000" opacity=".55"/>
<line x1="270" y1="25" x2="270" y2="165" stroke="#fff" stroke-width="1.5" stroke-dasharray="3 3"/></g>
<text x="232" y="100" fill="#fff" font-size="13" font-family="Cairo" text-anchor="middle">نهار</text>
<text x="305" y="100" fill="#cfd6ff" font-size="13" font-family="Cairo" text-anchor="middle">ليل</text>
<path d="M330 28 q28 10 26 34" fill="none" stroke="#9de0ff" stroke-width="2.2" marker-end="url(#ar)"/>
<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#9de0ff"/></marker></defs>
<text x="368" y="180" fill="#9de0ff" font-size="10" font-family="Cairo" text-anchor="end">الأرض بتلف حوالين نفسها كل ٢٤ ساعة</text>
</svg>''' % DEFS

Y, M, R = "يوسف", "مريم", "نجم"
pages = []
pages.append({"type":"cover","title":"الغلاف"})
pages.append({"type":"html","title":"إهداء","html":pg('<div class="quotemark" aria-hidden="true">”</div><p class="ded">لكل طفل بيبص للسما بالليل ويسأل: يا ترى فيه إيه هناك؟ الكتاب ده ليك.</p><p class="sign">أحمد الهنداوي</p>',2,"dedication"),
  "narration":"إهداء. لكل طفل بيبص للسما بالليل ويسأل: يا ترى فيه إيه هناك؟ الكتاب ده ليك."})
toc = [("البداية",[("رسالة من التلسكوب",3)]),("الفصل الأول: نجمنا الكبير",[("الشمس",4),("عيلة الشمس",5)]),
       ("الفصل الثاني: الكواكب الصخرية",[("جيران قريبين",6),("الأرض بيتنا",7)]),
       ("الفصل الثالث: العمالقة",[("الكواكب العملاقة",8),("تحدّي الأحجام",9)]),
       ("الفصل الرابع: الأرض والقمر",[("القمر وأطواره",10),("الليل والنهار والفصول",11)]),
       ("الفصل الخامس: لسه الرحلة مكمّلة",[("عيون على الفضاء",12),("اختبار رائد الفضاء",13)])]
t = '<h2>محتويات الرحلة</h2><p class="tag">دوس على أي عنوان وهتطير له على طول 🚀</p><ul class="toc">'
for ch, items in toc:
    t += '<li class="chap">%s</li>' % ch
    title = " · ".join(x for x, _ in items); idx = items[0][1]
    t += '<li><button class="tocrow" data-goto="%d"><span>%s</span><b>%s</b></button></li>' % (idx, title, n(idx+1))
t += '</ul>'
pages.append({"type":"html","title":"محتويات الرحلة","html":pg(t,3)})

pages.append({"type":"html","chapter":"البداية","title":"رسالة من التلسكوب","html":pg(
 '<h2>رسالة من التلسكوب</h2><p class="hook">الساعة ١٢ بالليل… والتلسكوب اللي فوق السطح بدأ يصفّر لوحده!</p><div class="emoji-hero">🔭🤖</div>'
 '<p class="lead">طلع يوسف ومريم يجروا، لقوا روبوت صغير بعيون منوّرة واقف جنب التلسكوب. قال لهم: «أنا نجم، روبوت مستكشف، ومحتاج مساعدين شطار للرحلة الأكبر في حياتهم.»</p>'
 + dlg(M,"رحلة لفين يا نجم؟") + dlg(R,"لعيلة الشمس كلها… ٨ كواكب، وقمر، وأسرار كتير!") +
 '<p class="cliff">ربطوا الأحزمة… والعدّ التنازلي بدأ: ٣… ٢… ١…</p>',4),
 "narration":"رسالة من التلسكوب. الساعة اتناشر بالليل، والتلسكوب بدأ يصفّر لوحده. يوسف ومريم لقوا روبوت صغير اسمه نجم، قال لهم إنه محتاج مساعدين للرحلة الأكبر في حياتهم: رحلة لعيلة الشمس كلها."})

pages.append({"type":"html","chapter":"الفصل الأول: نجمنا الكبير","title":"الشمس","html":pg(
 '<h2>الشمس: نجمنا الكبير</h2><p class="hook">هل تصدّق إن الشمس دي نجم… زي النجوم الصغيرة اللي بنشوفها بالليل؟</p>' + SUN +
 '<p>الشمس '+term("نجم","كرة ضخمة جدًا من غازات سخنة بتطلّع ضوء وحرارة من نفسها.")+' قريب مننا، عشان كده شايفينها كبيرة. وضوءها بياخد حوالي <b>٨ دقايق</b> عشان يوصل لنا!</p>'
 '<div class="callout tone-warning"><b>خلّي بالك</b><span>عمرك ما تبص للشمس مباشرة ولا بالتلسكوب: بتأذي العين جدًا.</span></div>',5),
 "narration":"الشمس نجمنا الكبير. الشمس نجم قريب مننا، وعرضها حوالي مية وتسعة مرة قد الأرض. ضوءها بياخد حوالي تمن دقايق عشان يوصل لنا. وخلّي بالك: عمرك ما تبص للشمس مباشرة."})

pages.append({"type":"html","chapter":"الفصل الأول: نجمنا الكبير","title":"عيلة الشمس","html":pg(
 '<h2>عيلة الشمس</h2><p class="hook">من شباك السفينة، شافوا الكواكب بتلف حوالين الشمس… كل واحد في طريقه!</p>' + orbits() +
 '<p>'+term("المجموعة الشمسية","الشمس وكل اللي بيلف حواليها: ٨ كواكب وأقمارها والكويكبات والمذنّبات.")+' فيها ٨ كواكب، كل كوكب بيلف في طريق اسمه '+term("المدار","الطريق اللي الكوكب بيمشي فيه وهو بيلف حوالين الشمس.")+'. وبلوتو؟ من سنة ٢٠٠٦ بقى اسمه كوكب قزم.</p>'
 '<div class="activity"><b>احفظها بسهولة</b><p>اعمل جملة تفكّرك بترتيب الكواكب من الأقرب للشمس.</p></div>',6),
 "narration":"عيلة الشمس. المجموعة الشمسية فيها تمن كواكب، كل كوكب بيلف في طريق اسمه المدار. الترتيب من الأقرب للشمس: عطارد، الزهرة، الأرض، المريخ، المشتري، زحل، أورانوس، نبتون. وبلوتو بقى كوكب قزم من سنة ألفين وستة."})

pages.append({"type":"html","chapter":"الفصل الثاني: الكواكب الصخرية","title":"جيران قريبين","html":pg(
 '<h2>جيران قريبين: الكواكب الصخرية</h2><p class="hook">أول ٤ كواكب ليهم أرض صلبة… تقدر تقف عليها، بس يا ترى تستحمل الجو؟</p>' + ROCKY +
 '<ul><li><b>عطارد:</b> أصغر كوكب وأقرب واحد للشمس.</li>'
 '<li><b>الزهرة:</b> أسخن كوكب! غلافها الجوي '+term("التقيل","غلاف جوي كثيف جدًا بيحبس حرارة الشمس جوّاه زي البطانية.")+' بيحبس الحرارة لحد حوالي ٤٦٥ درجة.</li>'
 '<li><b>الأرض:</b> بيتنا، الكوكب الوحيد اللي نعرف إن فيه حياة.</li>'
 '<li><b>المريخ:</b> الكوكب الأحمر، لونه من الصدأ اللي في تربته، وفيه أعلى بركان في المجموعة الشمسية.</li></ul>'
,7),
 "narration":"الكواكب الصخرية. عطارد أصغر كوكب وأقرب واحد للشمس. الزهرة أسخن كوكب لأن غلافها الجوي التقيل بيحبس الحرارة. الأرض بيتنا. والمريخ الكوكب الأحمر، لونه من الصدأ اللي في تربته."})

pages.append({"type":"html","chapter":"الفصل الثاني: الكواكب الصخرية","title":"الأرض بيتنا","html":pg(
 '<h2>الأرض بيتنا</h2><div class="emoji-hero">🌍💧🌱</div><p class="lead">لما بصّوا على الأرض من بعيد، شافوها نقطة زرقا صغيرة. نجم قال: «دي أغلى نقطة في الكون كله… عارفين ليه؟»</p>'
 '<div class="kterm"><b>سر الحياة على الأرض</b><span>مية سايلة، و'+term("غلاف جوي","طبقة هوا بتحيط بالكوكب، فيها الأكسجين اللي بنتنفسه، وبتحمينا من أشعة الشمس الضارة.")+' فيه أكسجين، ومسافة مناسبة من الشمس (حوالي ١٥٠ مليون كيلومتر): مش سخنة أوي ولا ساقعة أوي.</span></div>'
 + dlg(Y,"يعني لو كانت أقرب شوية كانت هتبقى زي الزهرة؟") + dlg(R,"وأبعد شوية كانت هتتجمّد. الأرض في المكان المظبوط!") +
 '<p class="cliff">بس استنوا… قدامنا كواكب أكبر من الأرض بمية مرة!</p>',8),
 "narration":"الأرض بيتنا. سر الحياة على الأرض: مية سايلة، وغلاف جوي فيه أكسجين، ومسافة مناسبة من الشمس حوالي مية وخمسين مليون كيلومتر، مش سخنة أوي ولا ساقعة أوي."})

pages.append({"type":"html","chapter":"الفصل الثالث: العمالقة","title":"الكواكب العملاقة","html":pg(
 '<h2>الكواكب العملاقة</h2><p class="hook">السفينة اتهزّت… قدامهم عاصفة أكبر من الأرض كلها!</p>'
 '<ul><li><b>المشتري:</b> أكبر كوكب، ممكن يساع حوالي ١٣٠٠ أرض جوّاه، وفيه '+term("البقعة الحمرا الكبيرة","عاصفة عملاقة على المشتري مستمرة من مئات السنين، وأكبر من الأرض.")+'.</li>'
 '<li><b>زحل:</b> مشهور بحلقاته المصنوعة من تلج وصخور.</li>'
 '<li><b>أورانوس:</b> بيلف وهو نايم على جنبه!</li>'
 '<li><b>نبتون:</b> أبعد كوكب، وفيه أسرع رياح في المجموعة الشمسية.</li></ul>'
 '<div class="kterm"><b>'+term("كواكب غازية","كواكب ضخمة معظمها غازات، ومالهاش أرض صلبة تقف عليها.")+'</b><span>العمالقة دول معظمهم غازات، يعني مفيش أرض تنزل عليها السفينة.</span></div>'
 + dlg(M,"يعني ماينفعش ننزل على المشتري؟") + dlg(R,"لأ خالص! هنفضل نتفرّج من فوق."),9),
 "narration":"الكواكب العملاقة. المشتري أكبر كوكب، يساع حوالي ألف وتلتمية أرض، وفيه عاصفة أكبر من الأرض. زحل مشهور بحلقاته. أورانوس بيلف وهو نايم على جنبه. ونبتون فيه أسرع رياح. العمالقة دول معظمهم غازات."})

pages.append({"type":"html","chapter":"الفصل الثالث: العمالقة","title":"تحدّي الأحجام","html":pg(
 '<h2>تحدّي الأحجام</h2><p class="hook">شايف النقطة الزرقا الصغيرة في الآخر؟ دي الأرض!</p>' + GIANTS +
 '<p>الرسمة دي بتقارن أحجام العمالقة بالأرض. المشتري عرضه حوالي ١١ مرة قد عرض الأرض.</p>'
 '<div class="activity"><b>جرّب في البيت</b><p>هات بطيخة (المشتري) وحبة حمص (الأرض) وحطّهم جنب بعض. حسّيت بالفرق؟ صوّرهم وورّي المدرس!</p></div>'
 ,10),
 "narration":"تحدّي الأحجام. المشتري عرضه حوالي حداشر مرة قد عرض الأرض. جرّب في البيت: بطيخة مكان المشتري، وحبة حمص مكان الأرض."})

pages.append({"type":"html","chapter":"الفصل الرابع: الأرض والقمر","title":"القمر وأطواره","html":pg(
 '<h2>القمر وأطواره</h2><p class="hook">في طريق الرجوع، القمر كان بيغيّر شكله… هلال، نص، بدر!</p>'
 '<div class="phases" aria-label="أطوار القمر">🌑🌒🌓🌔🌕🌖🌗🌘</div>'
 '<p>القمر هو '+term("التابع","جسم بيلف حوالين كوكب. القمر تابع الأرض.")+' بتاع الأرض. هو مش بينوّر من نفسه، هو بيعكس ضوء الشمس زي المراية.</p>'
 '<div class="kterm"><b>أطوار القمر</b><span>وإحنا شايفين القمر من الأرض، الجزء المنوّر منه بيكبر ويصغر، والدورة كلها بتاخد حوالي ٢٩ يوم ونص.</span></div>'
 + dlg(Y,"حد نزل على القمر قبل كده؟") + dlg(R,"أيوه! أول ناس نزلوا عليه سنة ١٩٦٩ في رحلة أبولو ١١.") ,11),
 "narration":"القمر وأطواره. القمر تابع الأرض، ومش بينوّر من نفسه، هو بيعكس ضوء الشمس. الجزء المنوّر اللي بنشوفه بيكبر ويصغر، والدورة بتاخد حوالي تسعة وعشرين يوم ونص. وأول ناس نزلوا على القمر سنة ألف تسعمية تسعة وستين."})

pages.append({"type":"html","chapter":"الفصل الرابع: الأرض والقمر","title":"الليل والنهار والفصول","html":pg(
 '<h2>الليل والنهار والفصول</h2><p class="hook">ليه وإحنا نايمين هنا، فيه أطفال في الناحية التانية من الأرض صاحيين؟</p>' + DAYNIGHT +
 '<ul><li><b>'+term("الدوران","لفّة الأرض حوالين نفسها، وبتعمل الليل والنهار.")+':</b> الأرض بتلف حوالين نفسها كل حوالي ٢٤ ساعة، فالناحية اللي قدام الشمس نهار والتانية ليل.</li>'
 '<li><b>'+term("الدوران حول الشمس","رحلة الأرض حوالين الشمس، وبتاخد سنة.")+':</b> بتاخد حوالي ٣٦٥ يوم وربع، يعني سنة.</li>'
 '<li><b>الفصول:</b> سببها إن محور الأرض مايل حوالي ٢٣٫٥ درجة.</li></ul>',12),
 "narration":"الليل والنهار والفصول. الأرض بتلف حوالين نفسها كل حوالي أربعة وعشرين ساعة، فالناحية اللي قدام الشمس نهار والتانية ليل. وبتلف حوالين الشمس في حوالي تلتمية خمسة وستين يوم وربع. والفصول سببها إن محور الأرض مايل."})

pages.append({"type":"html","chapter":"الفصل الخامس: لسه الرحلة مكمّلة","title":"عيون على الفضاء","html":pg(
 '<h2>عيون على الفضاء</h2><div class="emoji-hero">🛰️🚀</div><p class="lead">قبل ما ينزّلهم على السطح، فرّجهم نجم على «عيون» البشر في الفضاء.</p>'
 '<ul><li><b>تلسكوب جيمس ويب:</b> اتطلق آخر سنة ٢٠٢١، وبيصوّر نجوم ومجرات بعيدة جدًا.</li>'
 '<li><b>المركبة برسيفيرانس:</b> '+term("مركبة جوّالة","عربية روبوت بتمشي على سطح كوكب تانية وبتجمع صور وعينات.")+' بتستكشف المريخ من سنة ٢٠٢١ وبتدوّر على آثار حياة قديمة.</li>'
 '<li><b>الأقمار الصناعية:</b> بتساعدنا في الخرايط والتليفونات ومعرفة الطقس.</li></ul>'
 + dlg(M,"تفتكر هييجي يوم نروح المريخ؟") + dlg(R,"يمكن… وممكن تكوني إنتِ أول رائدة فضاء تروح!") +
 '<p class="cliff">بس الأول… لازم تعدّي اختبار رواد الفضاء!</p>',13),
 "narration":"عيون على الفضاء. تلسكوب جيمس ويب اتطلق آخر سنة ألفين واحد وعشرين وبيصوّر مجرات بعيدة جدًا. والمركبة برسيفيرانس بتستكشف المريخ من سنة ألفين واحد وعشرين. والأقمار الصناعية بتساعدنا في الخرايط والطقس."})

pages.append({"type":"html","chapter":"الفصل الخامس: لسه الرحلة مكمّلة","title":"اختبار رائد الفضاء","html":pg(
 '<h2>اختبار رائد الفضاء</h2><div class="emoji-hero">🏅👩‍🚀</div><p style="text-align:center">نجم جهّز لك ٨ أسئلة. جاوب صح وخد شارة رائد الفضاء!</p>'
 '<button class="qbtn" data-quiz="1">ابدأ الاختبار</button><p class="tag" style="text-align:center">٨ أسئلة · أحسن نتيجة هتظهر فوق</p>',14,"fill")})

pages.append({"type":"html","title":"عن المؤلف","html":pg(
 '<h2>عن المؤلف</h2><div class="emoji-hero">👨‍🏫</div><h3>أحمد الهنداوي</h3><p class="tag">AI4EduTech</p>'
 '<p>بيحب يحوّل الدرس لرحلة، ويعمل أدوات ذكية تساعد المدرسين يقدّموا العلوم بطريقة الأطفال يحبّوها.</p>',15,"fill")
 .replace('class="pg fill"','class="pg fill" style="text-align:center"')})
pages.append({"type":"back","title":"الغلاف الخلفي"})

quiz = [
 {"q":"الشمس تبقى إيه؟","options":["نجم","كوكب","قمر","مذنّب"],"a":"نجم","explanation":"الشمس نجم قريب مننا، كرة غازات سخنة بتطلّع ضوء وحرارة."},
 {"q":"كام كوكب في المجموعة الشمسية؟","options":["٨","٩","٧","١٠"],"a":"٨","explanation":"٨ كواكب، وبلوتو بقى كوكب قزم من سنة ٢٠٠٦."},
 {"q":"أسخن كوكب في المجموعة الشمسية هو…","options":["الزهرة","عطارد","المريخ","المشتري"],"a":"الزهرة","explanation":"غلاف الزهرة الجوي التقيل بيحبس الحرارة، فبقت أسخن من عطارد مع إنها أبعد."},
 {"q":"ليه المريخ لونه أحمر؟","options":["عشان الصدأ اللي في تربته","عشان قريب من الشمس","عشان مليان نار","عشان حلقاته حمرا"],"a":"عشان الصدأ اللي في تربته","explanation":"تربة المريخ فيها حديد صدّى، وده اللي مدّيه اللون الأحمر."},
 {"q":"أكبر كوكب في المجموعة الشمسية هو…","options":["المشتري","زحل","الأرض","نبتون"],"a":"المشتري","explanation":"المشتري يساع حوالي ١٣٠٠ أرض جوّاه."},
 {"q":"القمر بينوّر بالليل إزاي؟","options":["بيعكس ضوء الشمس","بيطلّع ضوء من نفسه","فيه نار جوّاه","بياخد ضوء من النجوم"],"a":"بيعكس ضوء الشمس","explanation":"القمر مش بينوّر من نفسه، هو بيعكس ضوء الشمس زي المراية."},
 {"q":"إيه اللي بيعمل الليل والنهار؟","options":["دوران الأرض حوالين نفسها","دوران القمر حوالين الأرض","حركة الشمس حوالين الأرض","السحاب"],"a":"دوران الأرض حوالين نفسها","explanation":"الأرض بتلف حوالين نفسها كل حوالي ٢٤ ساعة، فالناحية اللي قدام الشمس بيبقى فيها نهار."},
 {"q":"إيه اللي بيخلّي الحياة ممكنة على الأرض؟","options":["مية سايلة وهوا ومسافة مناسبة من الشمس","إنها أكبر كوكب","إن ليها حلقات","إنها أقرب كوكب للشمس"],"a":"مية سايلة وهوا ومسافة مناسبة من الشمس","explanation":"المية والغلاف الجوي والمسافة المظبوطة من الشمس هم سر الحياة على الأرض."},
]
book = {"meta":{"id":"solar-system-ar","title":"رحلة إلى المجموعة الشمسية","subtitle":"يوسف ومريم والروبوت نجم بين الكواكب","author":"أحمد الهنداوي","org":"AI4EduTech",
  "grade":"المرحلة الابتدائية","subject":"علوم","lang":"ar","dir":"rtl","theme":"cosmic","icon":"🪐","aspect":0.72,"voiceLang":"ar-EG",
  "sound":{"enabled":True,"volume":0.7},"blurb":"٨ كواكب، وقمر، وروبوت اسمه نجم… والرحلة لسه مكمّلة معاك."},
 "pages":pages,"quiz":quiz,
 "css":".pg svg.fig{width:100%;height:auto;display:block;margin:.2em 0 .8em;border-radius:14px;box-shadow:0 8px 22px rgba(10,6,40,.35)}"
       ".pg .phases{direction:ltr;text-align:center;font-size:1.75em;letter-spacing:.08em;margin:.2em 0 .6em;filter:drop-shadow(0 4px 8px rgba(0,0,0,.25))}"}
out = "/home/claude/morphbook/examples/solar-system-ar"
os.makedirs(out, exist_ok=True)
json.dump(book, open(out+"/book.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(pages), "pages")
