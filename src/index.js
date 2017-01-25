import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, combineReducers} from 'redux';
import {Provider, connect} from 'react-redux';

const todo = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      }
    case 'TOGGLE_TODO':
      if (state.id !== action.id) {
        return state;
      }
      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }

}

const todos = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        todo(undefined, action)
      ];
    case 'TOGGLE_TODO':
      return state.map(t => todo(t, action))
    default:
      return state;
  }

}

const visibilityFilter = (state = 'SHOW_ALL', action) => {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
}

const todoApp = combineReducers({
  todos,
  visibilityFilter
});

const Link = ({active, children, onClick}) => {
  if (active) {
    return <span>{children}</span>;
  }

  return (
    <a href='#' onClick={e => {
      e.preventDefault();
      onClick()
    }}>
      {children}
    </a>
  );
}

// Props of the container component are passed in via the second param to the props maps function.
// This allows us to take properties given by a user, and compare them to the state.
const mapStateToLinkProps = (state, ownProps) => {
  return {
    active: ownProps.filter === state.visibilityFilter
  }
};

// Like the map props function above, we need to use our props here too, and thankfully the second argument
// provides the properties for us.
const mapDispatchToLinkProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch({
        type: 'SET_VISIBILITY_FILTER',
        filter: ownProps.filter
      });
    }
  }
}
const FilterLink = connect(mapStateToLinkProps, mapDispatchToLinkProps)(Link);

const Todo = ({onClick, completed, text}) => {
	return (
    <li
        onClick={onClick}
        style={{
          textDecoration:
          completed ? 'line-through' : 'none'
        }}>
          {text}
        </li>
  );
}

const TodoList = ({todos, onTodoClick}) => {
	return (
    <ul>
      {todos.map(todo =>
        <Todo key={todo.id} {...todo} onClick={() => onTodoClick(todo.id)} />
      )}
    </ul>
  );
}

// VisibleTodoList container component
const mapStateToTodoListProps = (state) => {
  return {
    todos: getVisibleTodos(state.todos, state.visibilityFilter)
  };
};
const mapDispatchToTodoListProps = (dispatch) => {
  return {
    onTodoClick: (id) => {
      dispatch({
        type: 'TOGGLE_TODO',
        id
      });
    }
  };
};
const VisibleTodoList = connect(mapStateToTodoListProps, mapDispatchToTodoListProps)(TodoList);

// AddTodo simply needs a dispatch function, and doesn't need any props.
let AddTodo = ({dispatch}) => {
  let input;

	return (
  	<div>
      <input type="text" ref={node => input = node} />
      <button onClick={() => {
        dispatch({
          type: 'ADD_TODO',
          text: input.value,
          id: nextTodoId++
        });
        input.value = '';
      }}>
        Add Todo
      </button>
    </div>
  );
};
// Below we simply use connect and pass the dispatch function through.
// Also note we reassigned AddTodo so the user never needs to know about this.
// The first null - on the props maps, specifies that the component doesn't need to subscribe to the store at all.
// The second null - on the dispatch maps, specifies that the only dispatch is the vanilla dispatch function,
// available under dispatch (see the constructor)
// We can then remove the two nulls from `AddTodo = connect(null, null)(AddTodo)` to simplyify the code further.
AddTodo = connect()(AddTodo);

const Footer = () => (
	<p>
    Show:
    {' '}
    <FilterLink filter='SHOW_ALL'>All</FilterLink>
    {' '}
    <FilterLink filter='SHOW_ACTIVE'>Active</FilterLink>
    {' '}
    <FilterLink filter='SHOW_COMPLETED'>Completed</FilterLink>
  </p>
);

const getVisibleTodos = (todos, filter) => {
	switch (filter) {
  	case 'SHOW_ALL':
    	return todos;
    case 'SHOW_ACTIVE':
    	return todos.filter(t => !t.completed);
    case 'SHOW_COMPLETED':
    	return todos.filter(t => t.completed);
    default:
      return [];
  }
}

let nextTodoId = 0;
// Here, <AddTodo> references the redux container component that already has dispatch and wraps our UI component.
const TodoApp = () => (
  <div>
    <AddTodo />
    <VisibleTodoList />
    <Footer />
  </div>
);

ReactDOM.render(
  <Provider store={createStore(todoApp)}>
    <TodoApp />
  </Provider>
, document.getElementById('root'));
