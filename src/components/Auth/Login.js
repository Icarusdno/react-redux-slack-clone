import React from 'react';
import { Link } from 'react-router-dom';
import firebase from '../../firebase';
import { 
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from 'semantic-ui-react';

export default class Login extends React.Component {

  state = {
    email: '',
    password: '',
    errors: [],
    loading: false
  }

  displayErrors = errors => errors.map(({ message }, i) => <p key={i}>{message}</p>)

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.setState({ 
        errors: [],
        loading: true
      });

      const { email, password } = this.state;
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((signedInUser) => {
          console.log(signedInUser);
        })
        .catch((error) => {
          console.error(error);
          this.setState(({ errors }) => {
            return {
              errors: [
                ...errors,
                error
              ],
              loading: false
            }
          });
        })
    }
  }

  isFormValid = ({ email, password }) => email && password;

  handleInputError = (errors, inputName) => {
    return errors.some((error) => error.message.toLowerCase().includes(inputName)) ?
      'error' : '';
  }

  render() {
    const { errors, email, password, loading } = this.state;

    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="violet" textAlign="center">
            <Icon name="code branch" color="violet" />
            Login to DevChat
          </Header>
          <Form onSubmit={this.handleSubmit} size="large">
            <Segment stacked>
              <Form.Input
                className={this.handleInputError(errors, 'email')}
                fluid name="email"
                icon="mail" iconPosition="left"
                placeholder="Email Address"
                onChange={this.handleChange}
                value={email}
                type="email" />

              <Form.Input
                className={this.handleInputError(errors, 'password')}
                fluid name="password"
                icon="lock" iconPosition="left"
                placeholder="Password"
                onChange={this.handleChange}
                value={password}
                type="password" />

              <Button
                className={loading ? 'loading' : ''}
                disabled={loading}
                color="violet" fluid size="large"
                type="submit">
                Submit
              </Button>
            </Segment>
          </Form>
          {
            errors.length > 0 && (
              <Message error>
                <h3>Error</h3>
                { this.displayErrors(errors) }
              </Message>
            )
          }
          <Message>
            Don't have an account? <Link to="/register">Register</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
  }
}
