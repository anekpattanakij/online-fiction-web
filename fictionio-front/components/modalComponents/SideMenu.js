/* eslint-disable no-undef */
import React from 'react';
import PropTypes from 'prop-types';
import { Link, withTranslation } from '../../i18n';
import { connect } from 'react-redux';
import { logout } from '../../redux-saga/action/userAction';
import { searchFiction } from '../../redux-saga/action/searchAction';
import CoinIcon from '../CoinIcon';
import { withRouter } from 'next/router';

class SideMenu extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.props.logout.bind(this);
    this.searchRequest = this.searchRequest.bind(this);
    this.searchTextChange = this.searchTextChange.bind(this);
  }

  state = {
    searchText: '',
  };

  static async getInitialProps() {
    return {
      namespacesRequired: ['header'],
    };
  }

  searchTextChange(evt) {
    const searchText = evt.target.validity.valid ? evt.target.value : this.state.searchText;
    this.setState({ searchText: searchText });
  }

  searchRequest = () => {
    this.props.searchFiction(this.state.searchText);
    this.props.router.push('/search-result');
  };

  closeAllModal = () => {};

  componentDidMount() {
    this.closeAllModal = () => {
      $('#left_modal').modal('hide');
    };
  }

  render() {
    const { t, currentUser } = this.props;
    return (
      <div className="modal left fade" id="left_modal" tabIndex="-1" role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content border-0">
            <nav className="navbar fixed-top text-nowrap navbar-dark bg-dark  nav flex-column">
              <div className="container p-2">
                <div className="dropdown ">
                  {!(currentUser && currentUser.cif) ? (
                    <React.Fragment>
                      <Link href="/login">
                        <a className="dropdown-toggle no-underline" data-toggle="dropdown" role="button">
                          <span
                            className="fas fa-user-times fa-fw"
                            style={currentUser && currentUser.cif ? { display: 'none' } : { display: 'inline' }}
                          />
                          {t('header:guest')}
                        </a>
                      </Link>
                      <div className="dropdown-menu">
                        <Link href="/login">
                          <a
                            className="dropdown-item "
                            onClick={() => {
                              this.closeAllModal();
                            }}
                          >
                            <div>
                              <span className="fas fa-sign-in-alt fa-fw  " title="Login" /> {t('header:menu-fiction-login')}
                            </div>
                          </a>
                        </Link>
                        <Link href="/signup">
                          <a
                            className="dropdown-item "
                            onClick={() => {
                              this.closeAllModal();
                            }}
                          >
                            <div>
                              <span className="fas fa-user-plus fa-fw  " title="Signup" /> {t('header:menu-fiction-signup')}
                            </div>
                          </a>
                        </Link>
                      </div>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Link href="/update-profile">
                        <a
                          className="dropdown-toggle no-underline"
                          data-toggle="dropdown"
                          role="button"
                          onClick={() => {
                            this.closeAllModal();
                          }}
                        >
                          <span
                            className="fas fa-user fa-fw"
                            style={currentUser && currentUser.cif ? { display: 'inline' } : { display: 'none' }}
                          />
                          <span className="d-lg-none d-xl-inline" style={{ color: '#06f' }}>
                            {currentUser.displayName}
                          </span>
                        </a>
                      </Link>
                      <div className="dropdown-menu">
                        <Link href="/update-profile">
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              this.closeAllModal();
                            }}
                          >
                            <div>
                              <span className="fas fa-user fa-fw " /> {t('header:menu-fiction-profile')}
                            </div>
                          </a>
                        </Link>
                        <Link href="/coin-purchase">
                          <a
                            className="dropdown-item"
                            onClick={() => {
                              this.closeAllModal();
                            }}
                          >
                            <CoinIcon />
                            {currentUser.coin} {t('header:menu-fiction-coin')}
                          </a>
                        </Link>
                        <div className="dropdown-divider" />
                        <a
                          className="dropdown-item logout"
                          onClick={e => {
                            e.preventDefault();
                            this.logout();
                            this.closeAllModal();
                          }}
                        >
                          <div data-dismiss="modal">
                            <span className="fas fa-sign-out-alt fa-fw " title="Log out" />
                            {t('header:menu-fiction-log-out')}
                          </div>
                        </a>
                      </div>
                    </React.Fragment>
                  )}
                </div>
              </div>
            </nav>
            <nav style={{ marginTop: '70px' }} className="nav flex-column">
              <div className="dropdown nav-link">
                <Link href={'/'}>
                  <a
                    className="dropdown-toggle no-underline"
                    data-toggle="dropdown"
                    role="button"
                    onClick={() => {
                      this.closeAllModal();
                    }}
                  >
                    <span className="fas fa-book fa-fw " /> {t('menu-fiction')}
                  </a>
                </Link>
                <div className="dropdown-menu">
                  {currentUser && currentUser.logonStatus ? (
                    <Link href={'/fiction-new'}>
                      <a
                        className="dropdown-item "
                        onClick={() => {
                          this.closeAllModal();
                        }}
                      >
                        <span className="fas fa-plus-circle fa-fw " data-dismiss="modal" /> {t('header:menu-fiction-add')}
                      </a>
                    </Link>
                  ) : (
                    <Link href={'/login'}>
                      <a
                        className="dropdown-item "
                        onClick={() => {
                          this.closeAllModal();
                        }}
                      >
                        <span className="fas fa-plus-circle fa-fw " data-dismiss="modal" /> {t('header:menu-fiction-add')}
                      </a>
                    </Link>
                  )}
                </div>
              </div>
              <Link href="/write-new-story">
                <a
                  className="nav-link no-underline "
                  onClick={() => {
                    this.closeAllModal();
                  }}
                >
                  <span className="fas fa-pencil-alt fa-fw " /> {t('header:menu-write-new-story')}
                </a>
              </Link>
              <Link href="/how-to-translate-fiction">
                <a
                  className="nav-link no-underline "
                  onClick={() => {
                    this.closeAllModal();
                  }}
                >
                  <span className="fas fa-book-reader fa-fw " /> {t('header:menu-translate-fiction')}
                </a>
              </Link>
              <div className="dropdown nav-link">
                <a
                  className="dropdown-toggle no-underline"
                  data-toggle="dropdown"
                  role="button"
                  onClick={() => {
                    this.closeAllModal();
                  }}
                >
                  <span className="fas fa-info-circle fa-fw " /> {t('header:menu-info')}
                </a>
                <div className="dropdown-menu">
                  <Link href="/term-of-use">
                    <a
                      className="dropdown-item "
                      onClick={() => {
                        this.closeAllModal();
                      }}
                    >
                      <span className="fas fa-clipboard-list fa-fw " title="Stats" /> {t('header:menu-term-of-use')}
                    </a>
                  </Link>
                  <Link href="/privacy-policy">
                    <a
                      className="dropdown-item "
                      onClick={() => {
                        this.closeAllModal();
                      }}
                    >
                      <span className="fas fa-shield-alt fa-fw " title="Rules" /> {t('header:menu-privacy-policy')}
                    </a>
                  </Link>
                  <Link href="/about-us">
                    <a
                      className="dropdown-item "
                      onClick={() => {
                        this.closeAllModal();
                      }}
                    >
                      <span className="fas fa-info fa-fw " title="About" /> {t('header:menu-about-us')}
                    </a>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
    );
  }
}

SideMenu.propTypes = {
  t: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  logout: PropTypes.func,
  searchFiction: PropTypes.func,
  router: PropTypes.object,
};

const stateToProps = ({ user }) => ({
  currentUser: user.user,
  errorList: user.errorList,
});
const dispatchToProps = {
  logout,
  searchFiction,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation('header')(SideMenu)));
