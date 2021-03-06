import React, { Fragment, useState } from 'react';

//Connect to redux
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
//import  actions
import { setAlert } from '../../actions/alert';
import { register } from '../../actions/auth';

import PropTypes from 'prop-types';


// import axios from 'axios';

const Register = ({ setAlert, register, isAuthenticated }) => {

  const [ formData, setFormData ] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  })

  const { name, email, password, password2 } = formData;

  const onChange = e => setFormData( { ...formData, [e.target.name]: e.target.value } )

  const onSubmit = async e => {
    e.preventDefault()
    if (password !== password2) {
      setAlert('Passwords do not match', 'danger')
      console.log('Password do not match')
    } else {
      register({ name, email, password })


      // Axios post version
      // const newUser = {
      //   name: name,
      //   email: email,
      //   password: password
      // }
      // try {
      //   const config = {
      //     headers: {
      //       'Content-Type' : 'application/json'
      //     } 
      //   }
      //   const bodyToSend = JSON.stringify(newUser)
      //   const res = await axios.post('/api/users', bodyToSend, config)
      //   console.log(res.data)
      // } catch (error) {
      //   console.log('error in client register submit')
      //   console.error(error.response.data)
      // }
    }
  }

    //redirect if logged in
    if (isAuthenticated){
      return <Redirect to='/dashboard'/>
    }
  

  return (
    <Fragment>
      <h1 className='large text-primary'>Sign Up</h1>
      <p className='lead'><i className='fas fa-user'></i> Create Your Account</p>
      <form
        className='form'
        action='create-profile.html'
        onSubmit= {e => onSubmit(e)} >
        <div className='form-group'>
          <input
            type='text'
            placeholder='Name'
            name='name'
            required //html5 client side validation
            value= { name }
            onChange= {e => onChange(e)}
          />
        </div>
        <div className='form-group'>
          <input
            type='email'
            placeholder='Email Address'
            name='email'
            required //html5 client side validation
            value= { email }
            onChange= {e => onChange(e)}
          />
          <small className='form-text'>This site uses Gravatar so if you want a profile image, use a Gravatar email</small>
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Password'
            name='password'
            minLength='6'
            value= { password }
            onChange= {e => onChange(e)} 
          />
        </div>
        <div className='form-group'>
          <input
            type='password'
            placeholder='Confirm Password'
            name='password2'
            minLength='6'
            value= { password2 }
            onChange= {e => onChange(e)} 
          />
        </div>
        <input
          type='submit'
          className='btn btn-primary'
          value='Register'
        />
      </form>
      <p className='my-1'>
        Already have an account? <Link to='/login'>Sign In</Link>
      </p>
    </Fragment>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated : PropTypes.bool
}


const mapStateToProps = state => ({
  isAuthenticated : state.auth.isAuthenticated 
 })

//Connect to redux pass ( state, { actions-to-use })
export default connect(mapStateToProps, { setAlert, register })(Register);

