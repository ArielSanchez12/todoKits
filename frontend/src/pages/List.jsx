import Table from "../components/list/Table"

const List = () => {
    return (
        <div>
            <h1 className='font-black text-4xl text-black'>Listar</h1>
            <hr className='my-2 border-t-2 border-gray-300' />
            <p className='mb-8'>Este módulo te permite gestionar registros existentes</p>
            <Table />
        </div>
    )
}

export default List