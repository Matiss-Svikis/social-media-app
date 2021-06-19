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

const styles = (theme) => ({
    ...theme.customStyles
})


export class signup extends Component {

    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            loading: false,
            errors: {}
        }
    }
    handleSubmit = (event) => {
        event.preventDefault();
        this.setState({ loading: true });
        const newUserData = {
            email: this.state.email,
            password: this.state.password,
            confirmPassword: this.state.confirmPassword,
            handle: this.state.handle
        }
        axios.post('/signup', newUserData)
            .then(res => {
                localStorage.setItem('FBIdToken', `Bearer ${res.data.token}`)
                console.log(res.data);
                this.setState({ loading: false });
                this.props.history.push('/');
            })
            .catch(err => {
                this.setState({
                    errors: err.response.data,
                    loading: false
                })

            })
    }
    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value
        });
    }
    render() {
        const { classes } = this.props;
        const { errors, loading } = this.state;

        return (
            <Grid container className={classes.form}>
                <Grid item sm />
                <Grid item sm>
                    <img src={appIcon} className={classes.image} />
                    <Typography variant="h2" className={classes.pageTitle}>
                        Signup
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
                        <TextField id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            label="Confirm Password"
                            className={classes.textField}
                            value={this.state.confirmPassword}
                            onChange={this.handleChange}
                            fullWidth
                            helperText={errors.confirmPassword}
                            error={errors.confirmPassword ? true : false}
                        />
                        <TextField
                            id="handle"
                            name="handle"
                            type="text"
                            label="Handle"
                            className={classes.textField}
                            value={this.state.handle}
                            onChange={this.handleChange}
                            fullWidth
                            helperText={errors.handle}
                            error={errors.handle ? true : false}
                        />
                        {errors.general && (
                            <Typography variant="body2" className={classes.customError}>
                                {errors.general}
                            </Typography>
                        )}
                        <Button disabled={loading} type="submit" variant="contained" color="primary" className={classes.button}>Signup{loading && (
                            <CircularProgress size={30} className={classes.progress} />)}</Button>
                        <br />
                        <small>Already have an account? Login <Link to="/login">here</Link></small>
                    </form>
                </Grid>
                <Grid item sm />
            </Grid>
        )
    }
}

signup.protoTypes = {
    classes: PropTypes.object.isRequired
}

export default withStyles(styles)(signup)
