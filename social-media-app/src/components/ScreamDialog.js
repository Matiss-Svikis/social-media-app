import React, { Component } from "react";
import CloseIcon from "@material-ui/icons/Close";
import UnfoldMore from "@material-ui/icons/UnfoldMore";
import MyButton from "../util/MyButton";
import { Dialog, DialogContent } from "@material-ui/core/";
import PropTypes from "prop-types";
import withStyles from "@material-ui/core/styles/withStyles";
import { connect } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import { getScream } from "../redux/actions/dataActions";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const styles = (theme) => ({
  ...theme.customStyles,
  invisibleSeparator: {
    border: "none",
    maring: 4,
  },
  profileImage: {
    maxWidth: 200,
    height: 200,
    borderRadius: "50%",
    objectFit: "cover",
  },
  dialogContent: {
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    left: "90%",
  },
});

export class ScreamDialog extends Component {
  state = {
    open: false,
  };

  handleOpen = () => {
    this.setState({ open: true });
    this.props.getScream(this.props.screamId);
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  render() {
    const {
      classes,
      scream: { screamId, body, createdAt, likceCount, commentCount, userImage, userHandle },
      UI: { loading },
    } = this.props;

    const dialogMarkup = loading ? (
      <CircularProgress size={200} />
    ) : (
      <Grid container spacing={16}>
        <Grid item sm={5}>
          <img src={userImage} alt="Profile" className={classes.profileImage} />
        </Grid>
        <Grid item sm={7}>
          <Typography component={Link} color="primary" variant="h5" to={`/users/${userHandle}`}>
            @{userHandle}
          </Typography>
          <hr className={classes.invisibleSeparator} />
          <Typography variant="body2" color="textSecondary">
            Created at {dayjs(createdAt).format("h:mm a, MMM DD YYYY")}
          </Typography>
          <hr className={classes.invisibleSeparator} />
          <Typography variant="body1"> {body}</Typography>
        </Grid>
      </Grid>
    );

    return (
      <>
        <MyButton onClick={this.handleOpen} tip="Expand scream" tipClassName={classes.expandButton}>
          <UnfoldMore color="primary" />
        </MyButton>
        <Dialog open={this.state.open} onClose={this.handleClose} fullWidth maxWidth="sm">
          <MyButton tipClassName={classes.closeButton} tip="Close" onClick={this.handleClose}>
            <CloseIcon />
          </MyButton>
          <DialogContent className={classes.dialogContent}>{dialogMarkup}</DialogContent>
        </Dialog>
      </>
    );
  }
}

ScreamDialog.propTypes = {
  getScream: PropTypes.func.isRequired,
  screamId: PropTypes.string.isRequired,
  userHandle: PropTypes.string.isRequired,
  scream: PropTypes.object.isRequired,
  UI: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  scream: state.data.scream,
  UI: state.UI,
});

const mapActionsToProps = {
  getScream,
};

export default connect(mapStateToProps, mapActionsToProps)(withStyles(styles)(ScreamDialog));
