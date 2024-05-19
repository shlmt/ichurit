import React, { useRef } from 'react'
import { Menubar } from 'primereact/menubar'
import { Avatar } from 'primereact/avatar'
import { Menu } from 'primereact/menu'
import { removeToken } from '../features/auth/authSlice'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import apiSlice from '../app/apiSlice'

const Navbar = () => {

    const userFullName = localStorage.getItem('username') || '?'

    const items = [
        {
            label: 'עדכון נוכחות',
            icon: 'pi pi-check-circle',
            url: '/'
        },
        {
            label: 'ניהול',
            icon: 'pi pi-star',
            items: [
                {
                    label: 'נוכחות',
                    icon: 'pi pi-stopwatch',
                    url: '/lates'
                },
                {
                    label: 'תלמידות',
                    icon: 'pi pi-users',
                    url: '/students'
                },
                {
                    label: 'כיתות',
                    icon: 'pi pi-th-large',
                    url: '/classes'
                },
                {
                    separator: true
                },
                {
                    label: 'פתיחת שנה',
                    icon: 'pi pi-sun',
                    url: '/stepsNewYear'
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
                    url: '/classReport'
                },
                {
                    label: 'מצטיינות',
                    icon: 'pi pi-bolt',
                    url: '/excellentReport'
                },
                {
                    label: 'תעודות',
                    icon: 'pi pi-verified',
                    url: '/marks'
                }
            ]
        }
    ]

    const start = <Avatar size="medium" label={userFullName.charAt(0)} style={{ backgroundColor: '#6381AC', color: '#fff', fontSize: 18, cursor: 'pointer' }} shape="circle"
        onClick={(event) => menuRight.current.toggle(event)} aria-controls="popup_menu_right" aria-haspopup />

    const menuRight = useRef(null)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogoutClick = () => {
        dispatch(removeToken())
        dispatch(apiSlice.util.resetApiState())
        navigate("/")
    }

    const items2 = [
        {
            items: [
                {
                    label: 'הוספת משתמש',
                    icon: 'pi pi-user-plus'
                    // url: '/'
                },
                {
                    label: 'עדכון סיסמה',
                    icon: 'pi pi-user-edit',
                    url: '/editPassword'
                },
                {
                    label: 'התנתקות',
                    icon: 'pi pi-sign-out',
                    command: () => { handleLogoutClick() }
                }
            ]
        }
    ];

    return (<>
        <div className="card">
            <Menubar model={items} start={start} />
            <Menu model={items2} popup ref={menuRight} id="popup_menu_right" popupAlignment="right" />
        </div>
    </>
    )
}

export default Navbar