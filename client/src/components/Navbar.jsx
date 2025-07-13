import React, { useRef } from 'react'
import { Menubar } from 'primereact/menubar'
import { Avatar } from 'primereact/avatar'
import { Menu } from 'primereact/menu'
import { removeToken } from '../features/auth/authSlice'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import apiSlice from '../app/apiSlice'
import { Button } from 'primereact/button'
import { useLogoutMutation } from '../features/auth/authApiSlice'

const Navbar = ({ setRunTour }) => {
	const userFullName = useSelector((state) => state.auth?.userFullName) || localStorage.getItem('userName') || '?'
	const [logout, res] = useLogoutMutation()

	const items = [
		{
			label: 'עדכון נוכחות',
			icon: 'pi pi-check-circle',
			command: () => navigate('/')
		},
		{
			label: 'ניהול',
			icon: 'pi pi-star',
			items: [
				{
					label: 'נוכחות',
					icon: 'pi pi-stopwatch',
					command: () => navigate('/lates')
				},
				{
					label: 'תלמידות',
					icon: 'pi pi-users',
					command: () => navigate('/students')
				},
				{
					label: 'כיתות',
					icon: 'pi pi-th-large',
					command: () => navigate('/classes')
				},
				{
					separator: true
				},
				{
					label: 'פתיחת שנה',
					icon: 'pi pi-sun',
					command: () => navigate('/stepsNewYear')
				}
			]
		},
		{
			label: 'דוחות',
			icon: 'pi pi-database',
			items: [
				{
					label: 'נוכחות כיתה',
					icon: 'pi pi-calendar-times',
					command: () => navigate('/classReport')
				},
				{
					label: 'מצטיינות',
					icon: 'pi pi-bolt',
					command: () => navigate('/excellentReport')
				},
				{
					label: 'תעודות',
					icon: 'pi pi-verified',
					command: () => navigate('/marks')
				}
			]
		}
	]

	const start = (
		<Avatar
			size='medium'
			label={userFullName.charAt(0)}
			style={{ backgroundColor: '#6381AC', color: '#fff', fontSize: 18, cursor: 'pointer' }}
			shape='circle'
			onClick={(event) => menuRight.current.toggle(event)}
			aria-controls='popup_menu_right'
			aria-haspopup
		/>
	)

	const end = (
		<Button
			icon='pi pi-question'
			rounded
			outlined
			size='small'
			severity='help'
			onClick={() => setRunTour((prev) => prev + 1)}
			tooltip='סיור הדרכה'
		/>
	)

	const menuRight = useRef(null)
	const dispatch = useDispatch()
	const navigate = useNavigate()

	const handleLogoutClick = () => {
		dispatch(removeToken())
		dispatch(apiSlice.util.resetApiState())
		logout()
		navigate('/')
	}

	const items2 = [
		{
			items: [
				{
					label: 'עדכון סיסמה',
					icon: 'pi pi-user-edit',
					command: () => navigate('/editPassword')
				},
				{
					label: 'התנתקות',
					icon: 'pi pi-sign-out',
					command: () => {
						handleLogoutClick()
					}
				}
			]
		}
	]

	return (
		<>
			<div className='card'>
				<Menubar
					model={items}
					start={start}
					end={end}
					pt={{ end: { style: { marginRight: 'auto', marginLeft: '7px' } } }}
				/>
				<Menu model={items2} popup ref={menuRight} id='popup_menu_right' popupAlignment='right' />
			</div>
		</>
	)
}

export default Navbar
