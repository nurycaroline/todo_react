import React, { Component } from 'react';

export default class Todo extends Component {
    constructor(props){
        super(props);
        this.state = {
            todos: [], 
            id: '',
            description: '', 
            done: false,
            action: 'add'
        };
	}
	componentWillMount(){
		this.getTodos();
	}
    getTodos = () =>{
        fetch('https://todowebservice.herokuapp.com/api/todos')
			.then(response => {
				return response.json();
			})
			.then(response => {
				this.setState({todos: response});
			});
    }
	adicionar = () => {
        let {description, done, todos} = this.state;

        let data = JSON.stringify({
            "description": description,
            "done": done
        });

		fetch("https://todowebservice.herokuapp.com/api/todos", {
			method: "POST",
			body: data,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
		}).then(response => {
            return response.json();
        }).then(response => {
            if (response.errors){
                alert(response.errors.description.message);
            }else {
                todos.push(response);
                this.setState({todos: todos});
                alert('Registro inserido com sucesso.');
            }
        }).catch(err => console.error(err));
	}
    formatDate = (date) =>{
        let datef = new Date(date);
        let day = datef.getDay();
        day = day <= 9 ? '0' + day : day;
        let month = datef.getMonth() + 1;
        month = (month) <= 9 ? '0'+ month :month;
        return `${day}/${month}/${datef.getFullYear()}`;
    }
    adicionarEditar = (operation) => {
        if (operation === 'add'){
            this.adicionar();
        }else {
            this.editar();
        }
    }
    onClickEditar = (id) => {
        let todo = this.state.todos.find(todo => todo._id === id);
        this.setState({action: 'edit', description: todo.description, done: todo.done, id: todo._id});
    }
    editar = () => {
        let {description, done, id} = this.state;

        let data = JSON.stringify({
            "description": description,
            "done": done
        });

        fetch(`https://todowebservice.herokuapp.com/api/todos/${id}`, {
                method: "PUT",
                body: data,
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            }).then(response => {
                return response.json();
            }).then(response => {
                alert(`Registro atualizado com sucesso.`);
                this.getTodos();
                this.setState({description:'', done: false, id: ''});
            }).catch(err => console.error(err));
    }
    remover = (id, description) => {
        let {todos} = this.state;
		fetch(`https://todowebservice.herokuapp.com/api/todos/${id}`, {
			method: "DELETE"
		}).then(response => {
            return response;
        }).then(response => {
            alert(`Registro ${description} com sucesso.`);
            todos = todos.filter(todo => todo._id !== id);
            this.setState({todos: todos});
        }).catch(err => console.error(err));
    }
	render(){
		return (
			<div>
				<input type='text' value={this.state.description} onChange={(e) => this.setState({description: e.currentTarget.value})} /> 
				<input type='checkbox' checked={this.state.done} onChange={() => this.setState({done: !this.state.done})} />
				
				<button onClick={() => this.adicionarEditar(this.state.action)}> {this.state.action ? 'Adicionar': 'Atualizar'} </button>
				
				{
					this.state.todos.length && this.state.todos.map( todo => {
						return (
							<div key={todo._id} className='card'>
								<input type="checkbox" checked={todo.done} disabled />
								{todo.description}
                                 - 
                                {this.formatDate(todo.createdAt)}

                                <button onClick={() => this.onClickEditar(todo._id)}>Editar</button>
                                <button onClick={() => this.remover(todo._id, todo.description)}>Remover</button>
							</div>
						);
					})
				}
			</div>
		);
	}
}