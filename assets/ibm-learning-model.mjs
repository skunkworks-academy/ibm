export function isCurrent(course,today=new Date().toISOString().slice(0,10)) {
  return course.availability==='Content Available' && /^\d{4}-\d{2}-\d{2}$/.test(course.expires) && course.expires>today && !course.replacedBy && !course.retireReason;
}
export function filterCourses(courses,{query='',family='',level='',status='current',savedOnly=false,saved=[]}={}) {
  const words=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return courses.filter(c=>(!family||c.family===family)&&(!level||c.level===level)&&(status==='all'||isCurrent(c))&&(!savedOnly||saved.includes(c.code))&&words.every(w=>`${c.code} ${c.title} ${c.product} ${c.family} ${c.overview}`.toLowerCase().includes(w)));
}
export function enquiryUrl(courses) {
  const p=new URLSearchParams({source:'ibm-learning',course: courses.length===1 ? `${courses[0].code} — ${courses[0].title}`:'IBM team training',courseId:courses.map(c=>c.code).join(',')});
  return 'https://www.skunkworksacademy.com/course-registration/?'+p;
}
