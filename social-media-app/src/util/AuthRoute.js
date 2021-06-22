import React from 'react'
import { Route, Redirect } from "react-router-dom"
import { connect } from 'react-redux'

const mapStateToProps = (state) => ({
    authenticated: state.user.authenticated
})
export default connect(mapStateToProps)(function AuthRoute({ component: Component, authenticated, ...rest }) {
    return (
        <div>
            <Route {...rest}
                render={(props) => authenticated === true ? <Redirect to='/' /> : <Component {...props} />}
            />
        </div>
    )
});

