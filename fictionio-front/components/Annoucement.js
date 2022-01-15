import React from 'react';
import { withTranslation } from '../i18n';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadAnnoucement } from '../redux-saga/action/annoucementAction';
import * as moment from 'moment';

class Annoucement extends React.Component {
  componentDidMount() {
    if (!this.props.annoucementLastRefresh) {
      this.props.loadAnnoucement();
    }
  }

  render() {
    // eslint-disable-line class-methods-use-this
    return this.props.annoucementList
      ? this.props.annoucementList.map((annoucement, keyIndex) =>
          annoucement.language.toUpperCase() == this.props.i18n.language.toUpperCase() ? (
            <div
              id="announcement"
              className="alert alert-success alert-dismissible fade show text-center"
              role="alert"
              style={{ marginBottom: '1rem', marginTop: '1rem' }}
              key={keyIndex}
            >
              <button id="read_announcement_button" type="button" className="close" data-dismiss="alert">
                <span>×</span>
              </button>
              <strong>
                {annoucement.header} ({moment(new Date(annoucement.effectiveDate)).format('MMM Do')}):
              </strong>{' '}
              {annoucement.message}{' '}
              {annoucement.destinationUrl ? (
                <a href={annoucement.destinationUrl}>
                  <span className="fas fa-external-link-alt fa-fw " title="Annoucement" />
                </a>
              ) : (
                ''
              )}
            </div>
          ) : (
            ''
          ),
        )
      : '';
  }
}

Annoucement.propTypes = {
  annoucementList: PropTypes.array,
  loadAnnoucement: PropTypes.func,
  annoucementLastRefresh: PropTypes.any,
  i18n: PropTypes.object,
};

const stateToProps = ({ annoucement }) => ({
  annoucementList: annoucement.annoucementList,
  annoucementLastRefresh: annoucement.lastRefresh,
});

const dispatchToProps = { loadAnnoucement };

export default connect(
  stateToProps,
  dispatchToProps,
)(withTranslation('common')(Annoucement));
