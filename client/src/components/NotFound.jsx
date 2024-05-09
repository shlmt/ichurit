
const NotFound = (props) => {
    return (<>

        <h1 style={{ color: '#6381AC' }}>אופסססססס</h1>
        {props.allowed ? <h2>הגעת לכאן בטעות הדף אינו נמצא:(</h2> : <h2>אין לך הרשאה להציץ לכאן:(</h2>}
    </>)
}

export default NotFound