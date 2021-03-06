import React, { Component } from 'react'
import { TextField } from '@material-ui/core'
import { withStyles } from '@material-ui/styles'
import { PropTypes } from 'prop-types';
import { Grid } from '@material-ui/core';
import appIcon from "../images/monkey.png";
import { Typography } from '@material-ui/core';
import { Button } from '@material-ui/core';
import axios from "axios";
import { Link } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';
import { connect } from 'react-redux';
import { loginUser } from '../redux/actions/userActions';
const styles = (theme) => ({
    ...theme.customStyles
})


export class login extends Component {

    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            errors: {}
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.UI.errors) {
            this.setState({ errors: nextProps.UI.errors });
        }
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const userData = {
            email: this.state.email,
            password: this.state.password,
        }

        this.props.loginUser(userData, this.props.history);

    }
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }
    render() {
        const { classes, UI: { loading } } = this.props;
        const { errors } = this.state;

        return (
            <Grid container className={classes.form}>
                <Grid item sm />
                <Grid item sm>
                    <img src={appIcon} className={classes.image} />
                    <Typography variant="h2" className={classes.pageTitle}>
                        Login
                    </Typography>
                    <form noValidate onSubmit={this.handleSubmit}>
                        <TextField id="email" name="email" type="email" label="Email" className={classes.textField}
                            value={this.state.email}
                            onChange={this.handleChange}
                            fullWidth
                            helperText={errors.email}
                            error={errors.email ? true : false}

                        />
                        <TextField id="password" name="password" type="password" label="Password" className={classes.textField}
                            value={this.state.password}
                            onChange={this.handleChange}
                            fullWidth
                            helperText={errors.password}
                            error={errors.password ? true : false}
                        />
                        {errors.general && (
                            <Typography variant="body2" className={classes.customError}>
                                {errors.general}
                            </Typography>
                        )}
                        <Button disabled={loading} type="submit" variant="contained" color="primary" className={classes.button}>Login{loading && (
                            <CircularProgress size={30} className={classes.progress} />)}</Button>
                        <br />
                        <small>dont have an account? sign up <Link to="/signup">here</Link></small>
                    </form>
                </Grid>
                <Grid item sm />
            </Grid>
        )
    }
}

login.propTypes = {
    classes: PropTypes.object.isRequired,
    loginUser: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    UI: PropTypes.object.isRequired
}
const mapStateToProps = (state) => ({
    user: state.user,
    UI: state.UI
});

const mapActionsToProps = {
    loginUser
}
export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(login))
