import React from 'react';
import PropTypes from 'prop-types';

class Loading extends React.Component {
  render() {
    const { t, loading } = this.props;
    return loading ? (
      <div className="container" style={{"textAlign":"center"}}>
      <span className="fa fa fa-circle-notch fa-spin fa-spin" style={{"fontSize":"24px"}}/> {t('common:loading')}
      </div>
    ) : (
      ''
    );
  }
}

Loading.propTypes = {
  loading: PropTypes.bool.isRequired,
  t: PropTypes.func,
};

export default Loading;
