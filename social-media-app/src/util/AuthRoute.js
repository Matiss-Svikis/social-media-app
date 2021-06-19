import React from 'react'
import { Route, Redirect } from "react-router-dom"
export default function AuthRoute({ component: Component, authenticated, ...rest }) {
    return (
        <div>
            <Route {...rest}
                render={(props) => authenticated === true ? <Redirect to='/' /> : <Component {...props} />}
            />
        </div>
    )
}

