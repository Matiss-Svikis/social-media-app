import React, { Component } from 'react'
import { withStyles } from '@material-ui/styles'
import { Card, CardContent, CardMedia, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

const styles = {
    card: {
        display: "flex",
        marginBottom: 20,
    },
    image: {
        minWidth: 200,
        objectFit: 'cover'
    },
    content: {
        padding: 25,
    }

}

export class Scream extends Component {
    render() {
        dayjs.extend(relativeTime);
        const { classes, scream: { userImage, body, createdAt, userHandle, screamId, likeCounte, commentCount } } = this.props;

        return (
            <Card className={classes.card}>
                <CardMedia
                    image={userImage}
                    title="Profile image"
                    className={classes.image}
                />
                <CardContent className={classes.content}>
                    <Typography variant="h5" component={Link} to={`/users/${userHandle}`} color="primary">{userHandle}</Typography>
                    <Typography variant="body2" color="textSecondary">{dayjs(createdAt).fromNow()}</Typography>
                    <Typography variant="body1">{body}</Typography>
                </CardContent>
            </Card>
        )
    }
}

export default withStyles(styles)(Scream);
