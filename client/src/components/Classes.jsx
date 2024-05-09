import { useGetAllClassesQuery } from '../features/class/classApiSlice'
import Class from './Class'
import { Card } from 'primereact/card'
import NewClass from './NewClass'

const Classes = () => {

    const { data: classes = [], res } = useGetAllClassesQuery()

    return (
        <>
            <Card title='ניהול כיתות' style={{ maxWidth: '50%', marginRight: '25%' }}>
                <NewClass />
            </Card>

            <div style={{ display: 'flex', padding: '50px', flexWrap: 'wrap', justifyContent: "center" }}>
                {classes.map(c => <><Class grade={c.grade} number={c.number} teacher={c.teacher} id={c._id} email={c.email} style={{ width: '300px', height: '200px', margin: '10px' }} /><br /></>)}
            </div>
        </>
    )
}

export default Classes