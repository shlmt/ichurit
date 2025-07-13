import Joyride, { STATUS } from 'react-joyride'
import { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const steps = [
	{
		target: 'body',
		content: 'ברוך הבא למדריך שלנו!',
		placement: 'center'
	},
	{
		route: '/',
		target: '.p-menubar',
		content: 'זהו סרגל הניווט הראשי. כאן תוכל לעבור בין כל חלקי המערכת.',
		placement: 'bottom'
	},
	{
		route: '/',
		target: '.p-menubar-root-list > .p-menuitem:nth-child(1)',
		content:
			'עדכון נוכחות - כאן תוכל לעדכן נוכחות יומית לתלמידות. בחר תלמידה, תאריך, שעה, והוסף איחור. ניתן לסנן תלמידות לפי שם או כיתה.',
		placement: 'bottom'
	},
	{
		route: '/lates',
		target: '#root > div.p-card.p-component > div',
		content: 'ניהול איחורים - כאן תוכל לסנן תלמידות, לצפות באיחורים, ולבצע עדכון או מחיקה.'
	},
	{
		route: '/students',
		target: '#root > div.p-card.p-component > div',
		content: 'ניהול תלמידות - ניתן להוסיף, לחפש ולערוך פרטי תלמידה.'
	},
	{
		route: '/classes',
		target: '#root > div.p-card.p-component > div',
		content: 'ניהול כיתות - ניתן להוסיף כיתה חדשה, לערוך ולמחוק כיתות קיימות.'
	},
	{
		route: '/stepsNewYear',
		target: 'body',
		content: 'פתיחת שנה חדשה - בצע שלבים לפתיחת שנה חדשה במערכת.',
		placement: 'center'
	},
	{
		route: '/classReport',
		target: '#root > div.p-card.p-component > div',
		content: 'דו"ח נוכחות כיתה - בחר כיתה וטווח תאריכים, הפק דוח נוכחות, וייצא לאקסל.',
		placement: 'center'
	},
	{
		route: '/excellentReport',
		target: '#root > div.p-card.p-component > div',
		content: 'דו"ח מצטיינות - בחר טווח תאריכים ומספר איחורים מקסימלי, הפק דוח מצטיינות, וייצא לאקסל.',
		placement: 'center'
	},
	{
		route: '/marks',
		target: '#root > div.p-card.p-component > div',
		content: 'תעודות - בחר כיתה וטווח תאריכים, הפק דוח תעודות, ושלח במייל או ייצא לאקסל.',
		placement: 'center'
	},
	{
		route: '/',
		target: '.p-avatar',
		content: 'תפריט המשתמש - עדכון סיסמה או התנתקות מהמערכת.',
		placement: 'bottom'
	},
	{
		route: '/',
		target: '#root > div:nth-child(5)',
		content: 'כאן תוכל למצוא פרטי קשר למפתחות המערכת.',
		placement: 'top'
	}
]

const joyrideStyles = {
	options: {
		arrowColor: '#81a1c1',
		backgroundColor: '#eceff4',
		overlayColor: 'rgba(129,161,193,0.4)',
		primaryColor: '#81a1c1',
		textColor: '#222',
		zIndex: 10000,
		borderRadius: 10,
		fontFamily: 'inherit'
	},
	buttonClose: {
		color: '#81a1c1'
	},
	buttonNext: {
		backgroundColor: '#81a1c1',
		color: '#fff'
	},
	buttonBack: {
		color: '#81a1c1'
	}
}

const TOUR_KEY = 'ichurit_tour_completed'

const JoyrideTour = ({ start }) => {
	const [run, setRun] = useState(false)
	const [stepIndex, setStepIndex] = useState(0)
	const navigate = useNavigate()
	const location = useLocation()
	const prevPath = useRef(location.pathname)

	useEffect(() => {
		const completed = localStorage.getItem(TOUR_KEY)
		if (!completed) setRun(true)
	}, [])

	useEffect(() => {
		setRun(start)
	}, [start])

	const handleJoyrideCallback = (data) => {
		const { status, index, type } = data
		const finished = [STATUS.FINISHED, STATUS.SKIPPED].includes(status)
		if (finished) {
			localStorage.setItem(TOUR_KEY, 'true')
			setRun(false)
			if (prevPath.current && location.pathname !== prevPath.current) {
				navigate(prevPath.current)
			}
			setStepIndex(0)
		} else if (type === 'step:after') {
			const route = steps[index + 1]?.route
			if (route && location.pathname !== route) {
				navigate(route)
			}
			setStepIndex(index + 1)
		}
	}

	return (
		<Joyride
			steps={steps}
			stepIndex={stepIndex}
			run={run}
			continuous
			showProgress
			showSkipButton
			hideBackButton
			styles={joyrideStyles}
			locale={{
				close: 'סגור',
				last: 'סיום',
				next: 'הבא',
				skip: 'דלג',
				nextLabelWithProgress: 'הבא ({step} מתוך {steps})'
			}}
			callback={handleJoyrideCallback}
		/>
	)
}

export default JoyrideTour
