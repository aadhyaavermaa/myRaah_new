import type { Career, Milestone, Opportunity, Role } from './types'
export const roles: {id:Role; title:string; description:string}[] = [
  {id:'student',title:'Student',description:'Discover careers, learn skills, and find opportunities.'},
  {id:'mentor',title:'Mentor',description:'Guide students and share your experience.'},
  {id:'facilitator',title:'Facilitator',description:'Support students and connect them to pathways.'},
  {id:'employer',title:'Employer / Organisation',description:'Share opportunities and discover emerging talent.'},
]
export const careers: Career[] = [
 {title:'Community health worker',category:'Healthcare',description:'Help people access essential care and practical health information in their communities.',skills:['Communication','Wellbeing','Community outreach'],path:'Certificate or diploma in community health'},
 {title:'Early childhood educator',category:'Education',description:'Support young children as they learn, play, and build confidence.',skills:['Teaching','Patience','Creative learning'],path:'Early childhood education certificate'},
 {title:'Agriculture extension worker',category:'Agriculture',description:'Connect farmers with useful practices, resources, and local support.',skills:['Crop knowledge','Listening','Problem solving'],path:'Agriculture diploma or field training'},
 {title:'Electrician',category:'Skilled trades',description:'Install and maintain safe electrical systems in homes and workplaces.',skills:['Electrical basics','Safety','Practical reasoning'],path:'ITI or recognised apprenticeship'},
 {title:'Lab technician',category:'Science',description:'Prepare samples and support accurate testing in a laboratory setting.',skills:['Careful measurement','Lab safety','Record keeping'],path:'Diploma in medical laboratory technology'},
 {title:'Graphic designer',category:'Design',description:'Create useful visual communication for people, businesses, and communities.',skills:['Visual thinking','Typography','Design tools'],path:'Design course and a portfolio'},
 {title:'Bookkeeping assistant',category:'Finance',description:'Help small organisations keep clear, accurate financial records.',skills:['Numeracy','Organisation','Spreadsheet basics'],path:'Commerce certificate or bookkeeping course'},
 {title:'Public service officer',category:'Government',description:'Support citizens through public programmes and local services.',skills:['Communication','Civic knowledge','Administration'],path:'Relevant degree or public service exam preparation'},
 {title:'Small business owner',category:'Entrepreneurship',description:'Turn a useful idea into a sustainable local business.',skills:['Planning','Customer service','Budgeting'],path:'Business basics, mentorship, and a small pilot'},
 {title:'Solar installation technician',category:'Vocational',description:'Install and maintain solar energy systems for homes and businesses.',skills:['Electrical safety','Hands-on work','Troubleshooting'],path:'Renewable energy technician training'},
 {title:'Web developer',category:'Technology',description:'Build and maintain websites that help people get things done.',skills:['HTML and CSS','Logical thinking','Teamwork'],path:'Structured course and project portfolio'},
]
export const milestones: Milestone[] = [
 {title:'Explore career interests',detail:'Take a few minutes to notice what you enjoy.',done:true},
 {title:'Choose a career direction',detail:'Save a pathway that feels worth exploring.',done:false},
 {title:'Build your first skill',detail:'Start with a short lesson or practical activity.',done:false},
 {title:'Find a mentor',detail:'Ask someone experienced for guidance.',done:false},
]
export const opportunities: Opportunity[] = [
 {title:'Digital skills foundation',category:'Course',provider:'MyRaah demo listing',detail:'A self-paced introduction to everyday digital skills and online safety.',deadline:'No deadline listed',demo:true},
 {title:'Community learning scholarship',category:'Scholarship',provider:'Example opportunity · Demo',detail:'Illustrative listing to show how scholarship information will appear. Check official sources before applying.',deadline:'Demo date — not verified',demo:true},
 {title:'Local skills apprenticeship',category:'Apprenticeship',provider:'MyRaah demo listing',detail:'A sample pathway entry for exploring hands-on training opportunities.',deadline:'No deadline listed',demo:true},
 {title:'Career conversation',category:'Mentorship',provider:'MyRaah demo listing',detail:'Practice asking a mentor questions about a career you are exploring.',deadline:'Open year-round (demo)',demo:true},
]
