import React, { Component } from 'react';
import edit from "../assets/edit.png";
import remove from "../assets/remove.png";
import checked from '../assets/checked.png';
import noChecked from '../assets/no-checked.png';
import Modal from 'react-modal';

export default class Todo extends Component {
    constructor(props){
        super(props);
        this.state = {
            todos: [], 
            id: '',
            description: '', 
            done: false,
            action: 'add',
            isOpen: false,
            message: '',
            isOpenLoading: false

        };
	}
	componentWillMount(){
		this.getTodos();
	}
    getTodos = () =>{
        this.setState({isOpenLoading: true});
        fetch('https://todowebservice.herokuapp.com/api/todos')
			.then(response => {
				return response.json();
			})
			.then(response => {
				this.setState({todos: response, isOpenLoading: false});
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
                this.setState({todos: todos, description: '', done:false, message: response.errors.description.message, isOpen: true});
            }else {
                todos.push(response);
                this.setState({todos: todos, description: '', done:false, message: 'Registro inserido com sucesso.', isOpen: true});
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
                this.getTodos();
                this.setState({description:'', done: false, id: '', action: 'add', message: 'Registro atualizado com sucesso.', isOpen: true});
            }).catch(err => console.error(err));
    }
    remover = (id, description) => {
        let {todos} = this.state;
		fetch(`https://todowebservice.herokuapp.com/api/todos/${id}`, {
			method: "DELETE"
		}).then(response => {
            return response;
        }).then(response => {
            todos = todos.filter(todo => todo._id !== id);
            this.setState({todos: todos, message: `Registro ${description} com sucesso.`, isOpen: true});
        }).catch(err => console.error(err));
    }
	render(){
        let customStyle = {content : { top: '50%', boxShadow: '5px 5px 5px #888888', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', textAlign: 'right'}};

		return (
			<div>
				<div className='form'>
                    <div className='description_box'>
                        <label>Description</label><br />
                        <input className='description' type='text' value={this.state.description} onChange={(e) => this.setState({description: e.currentTarget.value})} /> 
                    </div>

                    <div className='done_box'>
                        <label>Done</label><br />
                         <input type='checkbox' checked={this.state.done} onChange={() => this.setState({done: !this.state.done})} />
                        <span></span>
                    </div>
                    
                    <button className='action' onClick={() => this.adicionarEditar(this.state.action)}> {this.state.action === 'add' ? 'Add': 'Update'} </button>

                </div>

                <br />
				
				{
					this.state.todos.length && this.state.todos.map( todo => {
						return (
							<div key={todo._id} className='card'>
                                <img className='checkbox' src={todo.done ? checked : noChecked} alt="checkbox"/>

                                <div className='desc'>
                                    <span className='createdAt'>{this.formatDate(todo.createdAt)}</span>
                                    <br />
                                    <span>{todo.description}</span>
                                </div>

                                <div className='buttons'>
                                    <button className='button' onClick={() => this.onClickEditar(todo._id)}>
                                        <img src={edit} alt='editar' />
                                    </button>
                                    <button className='button' onClick={() => this.remover(todo._id, todo.description)}>
                                        <img src={remove} alt='remover' />
                                    </button>
                                </div>
							</div>
						);
					})
				}

                <Modal isOpen={this.state.isOpenLoading} style={customStyle}>
                    <h1>Loading</h1>
                </Modal>

                <Modal isOpen={this.state.isOpen} style={customStyle}>
                    <button className='button_close' onClick={() => this.setState({isOpen: false})}>X</button>
                    <h1>{this.state.message}</h1>
                </Modal>
			</div>
		);
	}
}