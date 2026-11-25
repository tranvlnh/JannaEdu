'use strict';

const app = document.querySelector('#main');
const key = 'janna-edu-demo-v1';
let state = {};
try {
  const saved = JSON.parse(localStorage.getItem(key) || '{}');
  if (saved && typeof saved === 'object' && !Array.isArray(saved)) state = saved;
} catch {}
function save() {
  try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
}

const skills = ['Reading', 'Listening', 'Writing', 'Speaking'];
const bands = Array.from({ length: 11 }, (_, i) => (4 + i / 2).toFixed(1));
const courses = [
  ['IELTS Foundation', 'Band 4.0–5.0', 'Xây nền ngữ pháp, từ vựng và làm quen bốn kỹ năng.', 'foundation'],
  ['IELTS Intensive', 'Band 5.5–7.0', 'Luyện chiến lược theo dạng bài và chữa lỗi thường gặp.', 'intensive'],
  ['IELTS Advanced', 'Band 7.0+', 'Cải thiện lập luận, độ chính xác và diễn đạt.', 'advanced'],
  ['Luyện đề toàn diện', 'Mọi trình độ', 'Luyện Reading, Listening, Writing và Speaking.', 'practice'],
];
const stages = [
  ['1–2', 'Đánh giá và xây nền', 'Ôn dạng bài và tìm kỹ năng cần ưu tiên.'],
  ['3–6', 'Củng cố kỹ năng yếu', 'Luyện chiến thuật và xây vốn từ theo chủ đề.'],
  ['7–10', 'Luyện tập bốn kỹ năng', 'Tập phối hợp kỹ thuật trong điều kiện có thời gian.'],
  ['11–14', 'Thi thử và chữa lỗi', 'Ôn lỗi thường gặp và luyện đề tổng hợp.'],
];
const taskGroups = [
  [['Reading · Tìm ý chính', 'Đọc bài Library Garden và trả lời ba câu.', 'exam-reading'], ['Writing · Lập dàn ý Task 2', 'Viết mở bài và hai ý chính.', 'writing'], ['Listening · Nghe thông báo', 'Nghe và ghi lại giờ mở cửa.', 'exam-listening']],
  [['Listening · Nghe thông báo', 'Ghi lại thời gian và điều kiện đặt chỗ.', 'exam-listening'], ['Speaking · Tả nơi học', 'Nghe câu trả lời mẫu và nói lại bằng lời của bạn.', 'speaking']],
  [['Writing · Nêu quan điểm', 'Viết đoạn nêu quan điểm và một ví dụ.', 'writing'], ['Reading · Đọc tìm chi tiết', 'Gạch dưới các chi tiết liên quan đến câu hỏi.', 'exam-reading']],
];
const exams = {
  reading: {
    skill: 'Reading', title: 'Library Garden', duration: 600,
    passage: 'The Riverside Library opened a small garden behind its main building last April. Local volunteers built raised beds for herbs so children could learn how to grow food. On Saturdays, families can join a free workshop at ten in the morning. The library provides tools, but visitors should bring their own water bottles.',
    questions: [
      ['When did the garden open?', ['Last April', 'Last June', 'Last September'], 0, 'The passage says it opened last April.'],
      ['Why did volunteers build raised beds?', ['To sell flowers', 'To teach children to grow food', 'To store books'], 1, 'The beds help children learn how to grow food.'],
      ['What should visitors bring?', ['Gloves', 'Tools', 'Water bottles'], 2, 'The library supplies tools. Visitors bring water bottles.'],
    ],
  },
  listening: {
    skill: 'Listening', title: 'Riverside Library Notice', duration: 480,
    questions: [
      ['When does the study room open on weekdays?', ['9:00', '9:30', '10:30'], 1, 'The speaker says “nine thirty”.'],
      ['What do you need to book a desk?', ['A library card', 'A photo', 'An online receipt'], 0, 'The speaker asks visitors to bring their library card.'],
      ['How long can you reserve the room for?', ['One hour', 'Two hours', 'Three hours'], 1, 'The maximum reservation is two hours.'],
    ],
  },
};
const studentNav = [['student','Trang chủ'],['courses','Khóa học'],['practice','Luyện đề'],['examiner','Giám khảo AI'],['path','Lộ trình học'],['daily','Nhiệm vụ hằng ngày'],['progress','Tiến độ'],['academy','Sách và tài liệu'],['account','Tài khoản']];
const parentNav = [['parent','Trang chủ'],['parent-report','Báo cáo'],['parent-progress','Tiến độ học tập'],['parent-ai','Nhận xét AI'],['parent-path','Lộ trình học'],['parent-academy','Tài liệu và tài nguyên'],['parent-account','Tài khoản']];
const dates = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat('sv-SE', { timeZone:'Asia/Ho_Chi_Minh' }).format(new Date(Date.now() - (6-i) * 86400000)));
const labelDate = date => date.slice(8) + '/' + date.slice(5,7);
const getBand = (field, fallback) => bands.includes(state[field]) ? state[field] : fallback;
const goal = () => getBand('goal', '6.5');
const baseline = () => getBand('baseline', '5.0');
let current = 'home';
let selectedDay = 6;
let selectedWeek = 1;
let writing = '';
let timer;

const btn = (label, page, primary = false) => '<button type="button" data-page="'+page+'"'+(primary?' class="primary"':'')+'>'+label+'</button>';
const title = (name, sub) => '<div class="intro"><h1>'+name+'</h1>'+(sub?'<p class="muted">'+sub+'</p>':'')+'</div>';
const actions = html => '<div class="actions">'+html+'</div>';
const card = (label, html, cls = '') => '<article class="card '+cls+'"><h2>'+label+'</h2>'+html+'</article>';
const metric = (label, value) => '<article class="card"><h3>'+label+'</h3><p class="value">'+value+'</p></article>';
const list = (items, row) => '<ul class="list">'+items.map((item,index) => '<li>'+row(item,index)+'</li>').join('')+'</ul>';
const grid = html => '<div class="grid tight">'+html+'</div>';
const shell = (body, parent = false) => {
  const active = current.startsWith('exam-') || current.startsWith('result-') ? 'practice'
    : ['writing','speaking','writing-result','speaking-result'].includes(current) ? 'examiner' : current;
  return '<div class="shell"><nav class="card side" aria-label="'+(parent?'Khu vực phụ huynh':'Khu vực học sinh')+'">'
    +(parent?parentNav:studentNav).map(([id,label]) => '<button type="button" data-page="'+id+'" aria-current="'+(active===id?'page':'false')+'">'+label+'</button>').join('')
    +'</nav><section class="stack">'+body+'</section></div>';
};
const selectBand = (id, selected) => '<select id="'+id+'">'+bands.map(b => '<option'+(selected===b?' selected':'')+'>'+b+'</option>').join('')+'</select>';
const setup = html => '<section class="card form">'+html+'</section>';
const getChecks = day => new Set(Array.isArray(state.tasks?.[day]) ? state.tasks[day] : []);
const tasksFor = date => taskGroups[(Number(date.slice(8)) + 2) % taskGroups.length];
const hasPlacement = i => Array.isArray(state.placement) && state.placement.includes(i);
const placementDone = () => skills.every((_, i) => hasPlacement(i));
const courseTitle = () => courses[state.course]?.[0] || courses[1][0];

function examState(id) {
  state.exams ??= {};
  return state.exams[id] ??= { answers: {}, flags: {}, started: Date.now() };
}
function taskPage() {
  const date = dates[selectedDay];
  const tasks = tasksFor(date);
  const checked = getChecks(date);
  const count = tasks.filter((_, i) => checked.has(i)).length;
  const days = '<div class="actions days" aria-label="Chọn ngày">'+dates.map((d,i) =>
    '<button type="button" data-day="'+i+'" aria-pressed="'+(i===selectedDay)+'">'+(i===6?'Hôm nay':labelDate(d))+'</button>').join('')+'</div>';
  const rows = list(tasks, ([name,desc,target],i) =>
    '<label class="check item-title"><input type="checkbox" data-task="'+i+'" '+(checked.has(i)?'checked':'')+'><span><strong>'+name+'</strong><br><small>'+desc+'</small></span></label>'+btn('Vào bài',target));
  return shell(title('Nhiệm vụ hằng ngày','Chọn một ngày để xem bài tập và đánh dấu phần đã làm.')
    +card(count+'/'+tasks.length+' nhiệm vụ đã hoàn thành','<progress max="'+tasks.length+'" value="'+count+'" aria-label="Tiến độ nhiệm vụ"></progress>'+days+rows));
}
function pathPage(parent = false) {
  const detail = selectedWeek===1 ? [
    ['Reading','Xác định ý chính và chi tiết trong một đoạn văn.','Trả lời đúng ít nhất hai câu mẫu.'],
    ['Writing','Viết dàn ý cho một bài Task 2.','Có quan điểm rõ ràng, hai luận điểm và một ví dụ.'],
    ['Speaking','Mô tả nơi học yêu thích.','Nói trong một phút và đưa ra hai lý do.'],
  ] : [
    ['Listening','Nghe thông báo và ghi lại thời gian cùng điều kiện đặt chỗ.','Ghi đúng ít nhất hai thông tin.'],
    ['Reading','Làm đề ngắn có bấm giờ.','Nộp đủ câu và ghi lại lỗi cần sửa.'],
    ['Writing','Viết một đoạn thân bài có ví dụ.','Mỗi đoạn có câu chủ đề và giải thích.'],
  ];
  const weeks = actions([1,2].map(w=>'<button type="button" data-week="'+w+'" aria-pressed="'+(w===selectedWeek)+'">Tuần '+w+'</button>').join(''));
  return shell(title(parent?'Lộ trình học của con':'Lộ trình học','14 tuần hướng tới IELTS '+goal())
    +grid(stages.map(([range,name,desc])=>'<article class="card stage"><small>Tuần '+range+'</small><h3>'+name+'</h3><p>'+desc+'</p></article>').join(''))
    +card('Kế hoạch tuần '+selectedWeek,weeks+list(detail,([skill,activity,completion])=>'<div><strong>'+skill+'</strong><p>'+activity+'</p><small>Hoàn thành khi: '+completion+'</small></div>')),parent);
}
function examPage(id) {
  const exam = exams[id], attempt = examState(id);
  if (attempt.submitted) return resultsPage(id);
  const context = id==='reading'
    ? card('Đoạn đọc','<p lang="en">'+exam.passage+'</p>')
    : card('Đoạn nghe','<p>Nghe thông báo rồi chọn đáp án phù hợp.</p><audio controls preload="metadata" src="ref/demo-listening.mp3">Trình duyệt không hỗ trợ phát audio.</audio>');
  const questions = exam.questions.map(([prompt, options],i) =>
    '<fieldset class="question"><legend><strong>Câu '+(i+1)+'. '+prompt+'</strong></legend>'
    +options.map((answer,j)=>'<label><input type="radio" name="answer-'+i+'" data-question="'+i+'" value="'+j+'" '+(attempt.answers[i]===j?'checked':'')+'> '+answer+'</label>').join('')
    +'<button type="button" data-flag="'+i+'" aria-pressed="'+Boolean(attempt.flags[i])+'">'+(attempt.flags[i]?'Bỏ đánh dấu':'Đánh dấu câu')+'</button></fieldset>').join('');
  save();
  return shell(title(exam.title,exam.skill+' · Đề mẫu')+'<div class="split">'+context+card('Câu hỏi','<p><strong id="clock" aria-label="Thời gian còn lại"></strong></p>'+questions+actions('<button class="primary" type="button" data-submit="'+id+'">Nộp bài</button>'+btn('Về danh sách','practice')))+'</div>');
}
function resultsPage(id) {
  const exam = exams[id], attempt = state.exams?.[id];
  if (!attempt?.submitted) return shell(title('Chưa có kết quả')+card('Làm đề trước',actions(btn('Mở đề','exam-'+id,true))));
  const score = exam.questions.filter((q,i)=>attempt.answers[i]===q[2]).length;
  const rows = list(exam.questions,([prompt,options,correct,note],i) =>
    '<div><strong>Câu '+(i+1)+'. '+prompt+'</strong><p>Bạn chọn: '+(options[attempt.answers[i]] || 'Bỏ trống')+'</p><p class="result-key">Đáp án: '+options[correct]+'</p><small>'+note+'</small></div>');
  return shell(title('Kết quả · '+exam.skill,exam.title)+card(score+'/'+exam.questions.length+' câu đúng',rows+actions('<button type="button" class="primary" data-redo="'+id+'">Làm lại đề</button>'+btn('Về danh sách','practice'))));
}
const history = [['Reading','5.5',3],['Listening','6.0',4],['Writing','5.0',5],['Speaking','5.5',6]];
function activity() {
  return list(history,([name,band,day])=>'<strong>'+name+' · Band '+band+'</strong><small>'+labelDate(dates[day])+'</small>');
}
function chart() {
  const lines = [
    ['Overall','#0b2a5b','32,102 120,102 208,102 296,86 384,86 472,86 560,70'],
    ['Reading','#168365','32,116 120,116 208,100 296,100 384,100 472,76 560,76'],
    ['Listening','#2f6bff','32,96 120,96 208,74 296,74 384,52 472,52 560,52'],
    ['Writing','#a05007','32,130 120,130 208,130 296,110 384,110 472,102 560,102'],
    ['Speaking','#7540b6','32,111 120,100 208,100 296,100 384,90 472,90 560,74'],
  ];
  return '<svg class="chart" viewBox="0 0 592 156" role="img" aria-label="Xu hướng band bốn kỹ năng và Overall trong 7 ngày">'
    +'<path d="M32 32H560M32 65H560M32 98H560M32 131H560" stroke="#dbe5f3"/>'
    +lines.map(([,color,points])=>'<polyline fill="none" stroke="'+color+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="'+points+'"/>').join('')
    +'</svg><div class="axis">'+dates.map(d=>'<span>'+labelDate(d)+'</span>').join('')+'</div>'
    +'<p class="actions">'+lines.map(([name,color])=>'<span style="color:'+color+'">● '+name+'</span>').join('')+'</p>';
}
function progressPage(parent) {
  return shell(title(parent?'Tiến độ học tập của con':'Tiến độ của bạn','Kết quả minh họa trong 7 ngày gần đây.')
    +card('Band theo kỹ năng',chart())+card('Bài đã nộp',activity()),parent);
}
function academyPage(parent) {
  const books = [
    ['Sổ tay Reading', 'Luyện tìm ý chính và nhận diện từ khóa.', 'exam-reading'],
    ['Bài nghe theo chủ đề', 'Ôn dạng thông báo và ghi thông tin.', 'exam-listening'],
    ['Mẫu dàn ý Writing', 'Tham khảo cách xây luận điểm và ví dụ.', 'writing'],
  ];
  return shell(title(parent?'Tài liệu và tài nguyên':'Sách và tài liệu','Tài nguyên minh họa cho tuần đầu.')
    +grid(books.map(([name,desc,target])=>card(name,'<p>'+desc+'</p>'+actions(btn(parent?'Xem chủ đề':'Mở bài mẫu',parent?'parent-path':target)))).join('')),parent);
}
const annotated = '<p><strong>Điểm làm tốt:</strong> Nêu được ý chính và một ví dụ cụ thể.</p><p><strong>Ưu tiên tuần tới:</strong> Dùng câu chủ đề rõ ràng và giải thích vì sao ví dụ hỗ trợ lập luận.</p>';
const views = {
  home: () => '<section class="hero"><h1>Chinh phục IELTS<br>cùng Janna Edu</h1><p>Luyện bốn kỹ năng theo mục tiêu của bạn. Phụ huynh có thể theo dõi kết quả của con.</p>'+btn('Xem khóa học','courses')+'</section>'
    +'<div class="grid">'+[
      ['Luyện đề IELTS','Mở đề mẫu Reading hoặc Listening và thử chấm điểm.','practice'],
      ['Giám khảo AI','Xem báo cáo minh họa cho Writing và Speaking.','examiner'],
      ['Nhiệm vụ và lộ trình','Theo dõi checklist mỗi ngày trong kế hoạch 14 tuần.','daily'],
      ['Góc phụ huynh','Theo dõi kết quả học tập của con trong 7 ngày.','parent'],
    ].map(([name,desc,route])=>card(name,'<p>'+desc+'</p>'+actions(btn('Xem thử',route)))).join('')+'</div>',
  courses: () => shell(title('Khóa học IELTS','Chọn khóa để thử luồng mua và bắt đầu học. Thao tác này được mô phỏng.')
    +grid(courses.map(([name,range,desc,slug],i)=>card(name,'<img class="course-image" src="ref/course-'+slug+'.jpg" alt=""><span class="tag">'+range+'</span><p>'+desc+'</p>'+actions('<button class="primary" type="button" data-buy="'+i+'">Mua khóa học</button>'))).join(''))),
  setup: () => setup(title('Thiết lập mục tiêu',courseTitle()+' · Đã mở trong bản demo')
    +'<label>Band mục tiêu'+selectBand('goal',goal())+'</label><label>Band hiện tại'+selectBand('baseline',baseline())+'</label>'
    +actions('<button type="button" class="primary" data-self="true">Lưu band tự khai</button>'+btn('Tôi chưa biết band','placement'))),
  placement: () => setup(title('Kiểm tra năng lực đầu vào','Mô phỏng lần lượt bốn kỹ năng để nhận band đầu vào.')
    +list(skills,(name,i)=>'<strong>'+name+'</strong><button type="button" data-skill="'+i+'" '+(hasPlacement(i)?'disabled':'')+'>'+(hasPlacement(i)?'Band '+['5.5','6.0','5.0','5.5'][i]:'Mô phỏng nộp bài')+'</button>')
    +(placementDone()?'<p><strong>Band đầu vào mẫu 5.5</strong></p>'+actions('<button class="primary" type="button" data-finish="true">Vào học</button>'):'')),
  student: () => shell(title('Trang chủ học sinh','Xin chào, Minh Anh!')+grid(metric('Band hiện tại',baseline())+metric('Mục tiêu IELTS',goal())+metric('Nhiệm vụ hôm nay',getChecks(dates[6]).size+'/'+tasksFor(dates[6]).length))
    +card('Tuần 1 · Đánh giá và xây nền','<p>Ôn dạng bài và xác định kỹ năng cần ưu tiên.</p>'+actions(btn('Mở nhiệm vụ hôm nay','daily',true)+btn('Xem lộ trình','path')+btn('Luyện đề','practice')))),
  daily: taskPage,
  path: () => pathPage(),
  practice: () => shell(title('Luyện đề IELTS','Chọn đề để trả lời, đánh dấu và xem lời giải.')
    +grid(Object.entries(exams).map(([id,exam])=>card(exam.skill+' · '+exam.title,'<p>3 câu hỏi · '+exam.duration/60+' phút</p>'+actions(btn(state.exams?.[id]?.submitted?'Xem kết quả':'Mở đề mẫu',state.exams?.[id]?.submitted?'result-'+id:'exam-'+id,true)))).join(''))),
  'exam-reading': () => examPage('reading'), 'exam-listening': () => examPage('listening'),
  'result-reading': () => resultsPage('reading'), 'result-listening': () => resultsPage('listening'),
  examiner: () => shell(title('Giám khảo AI','Thử gửi bài để xem báo cáo minh họa.')
    +grid(card('Writing Task 2','<p>Viết một đoạn nêu quan điểm.</p>'+actions(btn('Mở Writing','writing',true)))+card('Speaking Part 2','<p>Luyện nói về một nơi bạn thích học.</p>'+actions(btn('Mở Speaking','speaking',true))))),
  writing: () => shell(title('Writing Task 2','Bài viết minh họa')
    +card('Online learning','<p lang="en">Some students prefer studying online. What are the advantages and disadvantages?</p><form id="writing"><label>Phần trả lời<textarea id="essay" required maxlength="2500"></textarea></label>'+actions('<button type="submit" class="primary">Xem chấm điểm mẫu</button>')+'</form>')),
  speaking: () => shell(title('Speaking Part 2','Luyện với một chủ đề mẫu')
    +card('Describe a place where you like to study','<p lang="en">Say where it is, what it is like, and why you like studying there.</p><details><summary>Gợi ý trả lời</summary><p lang="en">I like studying in a quiet room at the local library. I can focus there and take short breaks in the garden.</p></details>'+actions(btn('Xem chấm điểm mẫu','speaking-result',true)))),
  'writing-result': () => shell(title('Nhận xét Writing','Kết quả mẫu · Band 5.5')+card('Góp ý cho bài viết',annotated+actions(btn('Về Giám khảo AI','examiner')))),
  'speaking-result': () => shell(title('Nhận xét Speaking','Kết quả mẫu · Band 5.5')+card('Góp ý cho bài nói','<p>Nêu rõ nơi học và lý do yêu thích. Thêm ví dụ cụ thể và luyện nói liền mạch trong một phút.</p>'+actions(btn('Về Giám khảo AI','examiner')))),
  progress: () => progressPage(false),
  academy: () => academyPage(false),
  account: () => shell(title('Tài khoản học sinh','Minh Anh · Tài khoản mẫu')+card('Mục tiêu học tập','<p>IELTS '+goal()+'</p>'+actions(btn('Đổi mục tiêu','setup')+btn('Xem vai trò phụ huynh','parent')))),
  parent: () => shell(title('Tổng quan học tập của con','Minh Anh · Dữ liệu minh họa')+grid(metric('Overall gần nhất','5.5')+metric('Mục tiêu IELTS',goal())+metric('Bài đã nộp trong 7 ngày','4'))
    +'<div class="split">'+card('Tiến độ học tập 7 ngày gần đây',chart())+card('Hoạt động gần đây',activity())+'</div>',true),
  'parent-progress': () => progressPage(true),
  'parent-path': () => pathPage(true),
  'parent-report': () => shell(title('Báo cáo học tập','Tóm tắt 7 ngày của Minh Anh')
    +grid(metric('Bài đã nộp','4')+metric('Overall','5.5')+metric('Mục tiêu',goal()))+card('Kết quả từng bài',activity()),true),
  'parent-ai': () => shell(title('Nhận xét AI','Nhận xét minh họa cho phụ huynh')+card('Gợi ý cho tuần tới',annotated+actions(btn('Xem lộ trình của con','parent-path'))),true),
  'parent-academy': () => academyPage(true),
  'parent-account': () => shell(title('Tài khoản phụ huynh','Tài khoản mẫu')+card('Học sinh đang theo dõi','<p>Minh Anh · IELTS '+goal()+'</p>'+actions(btn('Về tổng quan','parent'))),true),
};

function go(page) {
  if (location.hash === '#'+page) render(true);
  else location.hash = page;
}
function submitExam(id) {
  examState(id).submitted = true;
  save();
  go('result-'+id);
}
function render(focus) {
  clearInterval(timer);
  const page = location.hash.slice(1);
  current = Object.hasOwn(views,page) ? page : 'home';
  app.innerHTML = views[current]();
  if (current==='writing') document.querySelector('#essay').value = writing;
  document.querySelectorAll('header button[data-page]').forEach(button => {
    const route = button.dataset.page;
    const active = route === current || (route==='parent' && current.startsWith('parent-'));
    if (active) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
  });
  const clock = document.querySelector('#clock');
  if (clock) {
    const id = current.slice(5);
    const tick = () => {
      const seconds = Math.max(0, exams[id].duration - Math.floor((Date.now()-examState(id).started)/1000));
      clock.textContent = Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
      if (!seconds) submitExam(id);
    };
    timer = setInterval(tick,1000);
    tick();
  }
  if (focus) {
    const heading = app.querySelector('h1');
    heading.tabIndex = -1;
    heading.focus({ preventScroll:true });
    window.scrollTo(0,0);
  }
}

document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  app.focus();
});
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const d = button.dataset;
  if (d.page) go(d.page);
  else if (d.buy!==undefined) {
    state.course = Number(d.buy);
    state.placement = [];
    save();
    go('setup');
  } else if (d.self || (d.finish && placementDone())) {
    if (d.finish) state.baseline = '5.5';
    save();
    go('student');
  } else if (d.skill!==undefined) {
    state.placement = skills.map((_,i)=>i).filter(i=>hasPlacement(i) || i===Number(d.skill));
    save();
    render(false);
    app.querySelector('button[data-skill]:not(:disabled), button[data-finish]')?.focus();
  } else if (d.day || d.week) {
    if (d.day) selectedDay = Number(d.day);
    else selectedWeek = Number(d.week);
    render(false);
    app.querySelector(d.day?'[data-day="'+d.day+'"]':'[data-week="'+d.week+'"]')?.focus();
  } else if (d.flag!==undefined) {
    const attempt = examState(current.slice(5));
    attempt.flags[d.flag] = !attempt.flags[d.flag];
    button.setAttribute('aria-pressed',String(attempt.flags[d.flag]));
    button.textContent = attempt.flags[d.flag]?'Bỏ đánh dấu':'Đánh dấu câu';
    save();
  } else if (d.submit) submitExam(d.submit);
  else if (d.redo) {
    delete state.exams[d.redo];
    save();
    go('exam-'+d.redo);
  }
});
app.addEventListener('change', event => {
  const input = event.target;
  if (['goal','baseline'].includes(input.id) && bands.includes(input.value)) state[input.id] = input.value;
  if (input.dataset.question!==undefined) examState(current.slice(5)).answers[input.dataset.question] = Number(input.value);
  if (input.dataset.task!==undefined) {
    const day = dates[selectedDay], index = Number(input.dataset.task), checks = getChecks(day);
    if (input.checked) checks.add(index); else checks.delete(index);
    state.tasks ??= {};
    state.tasks[day] = [...checks];
    render(false);
    app.querySelector('[data-task="'+index+'"]').focus();
  }
  save();
});
app.addEventListener('input', event => {
  if (event.target.id==='essay') writing = event.target.value;
});
app.addEventListener('submit', event => {
  if (event.target.id !== 'writing') return;
  event.preventDefault();
  go('writing-result');
});
window.addEventListener('hashchange', () => render(true));
render(false);
