import React from 'react';
import PropTypes from 'prop-types';
import { generateStaticPath } from '../util/staticPathUtil';
import { Link, withTranslation } from '../i18n';
import { connect } from 'react-redux';
import ReactSVG from 'react-svg';
import Config from '../config/index';
import { logout } from '../redux-saga/action/userAction';
import { searchFiction } from '../redux-saga/action/searchAction';
import CoinIcon from '../components/CoinIcon';
import { withRouter } from 'next/router';
import * as moment from 'moment';

class Header extends React.Component {
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

  render() {
    const { t, currentUser, router, isSessionTimeout } = this.props;
    if (this.props.i18n.language) {
      moment.locale(this.props.i18n.language);
    }
    if (isSessionTimeout && router.pathname.indexOf('login') < 0) {
      this.props.router.push('/login');
    }
    return (
      <header>
        <nav className="navbar fixed-top navbar-expand-lg text-nowrap navbar-dark bg-dark">
          <div className="container">
            <button className="navbar-toggler" type="button" data-toggle="modal" data-target="#left_modal">
              <span className="navbar-toggler-icon" />
            </button>
            <div>
              <a className="p-0 navbar-brand mx-1" href="https://fictionio.com/">
                <ReactSVG
                  src={generateStaticPath('/img/fictionio-logo.svg')}
                  beforeInjection={svg => {
                    svg.setAttribute('style', 'height: 35px;width: 35px');
                    svg.setAttribute('fill', 'white');
                  }}
                  wrapper="span"
                  className="mr-2"
                />
                <small className="d-lg-none d-xl-inline">Fictionio</small>
              </a>
            </div>
            <li className="nav-item dropdown" style={{ listStyle: 'none' }}>
              <button className="navbar-toggler ml-auto" type="button">
                <a
                  href="#"
                  className="nav-link dropdown-toggle"
                  data-toggle="dropdown"
                  role="button"
                  style={{ color: 'rgba(255,255,255,.5)', fontSize: '1rem' }}
                >
                  <ReactSVG
                    className="flag-icon"
                    src={generateStaticPath('/img/flag/' + ('' + this.props.i18n.language).toLowerCase() + '.svg')}
                  />
                  <div className="d-none d-md-inline ml-2">{('' + this.props.i18n.language).toUpperCase()}</div>
                </a>
                <div className="dropdown-menu">
                  {Config.i18n.whitelist.map((countryCode, i) => (
                    <a key={i} className="dropdown-item " onClick={() => this.props.i18n.changeLanguage(countryCode)}>
                      <ReactSVG className="flag-icon" src={generateStaticPath('/img/flag/' + countryCode + '.svg')} />
                      <div className="d-inline ml-2">{countryCode.toUpperCase()}</div>
                    </a>
                  ))}
                </div>
              </button>
            </li>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item dropdown mx-1">
                  <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown" role="button">
                    <span className="fas fa-book fa-fw " />
                    {t('menu-fiction')}
                  </a>
                  <div className="dropdown-menu">
                    {currentUser && currentUser.logonStatus ? (
                      <Link href={'/fiction-new'}>
                        <a className="dropdown-item ">
                          <span className="fas fa-plus-circle fa-fw " />
                          {t('header:menu-fiction-add')}
                        </a>
                      </Link>
                    ) : (
                      <Link href={'/login'}>
                        <a className="dropdown-item ">
                          <span className="fas fa-plus-circle fa-fw " />
                          {t('header:menu-fiction-add')}
                        </a>
                      </Link>
                    )}
                  </div>
                </li>
                <li className="nav-item mx-1 ">
                  <Link href="/write-new-story">
                    <a className="nav-link">
                      <span className="fas fa-pencil-alt fa-fw " />
                      {t('header:menu-write-new-story')}
                    </a>
                  </Link>
                </li>
                <li className="nav-item mx-1 ">
                  <Link href="/how-to-translate-fiction">
                    <a className="nav-link">
                      <span className="fas fa-book-reader fa-fw " />
                      {t('header:menu-translate-fiction')}
                    </a>
                  </Link>
                </li>
                <li className="nav-item mx-1 dropdown">
                  <a className="nav-link dropdown-toggle" data-toggle="dropdown" role="button">
                    <span className="fas fa-info-circle fa-fw " />
                    {t('header:menu-info')}
                  </a>
                  <div className="dropdown-menu">
                    <Link href="/term-of-use">
                      <a className="dropdown-item">
                        <span className="fas fa-clipboard-list fa-fw " title="Term of use" />
                        {t('header:menu-term-of-use')}
                      </a>
                    </Link>
                    <Link href="/privacy-policy">
                      <a className="dropdown-item">
                        <span className="fas fa-shield-alt fa-fw " title="Privacy policy" />
                        {t('header:menu-privacy-policy')}
                      </a>
                    </Link>
                    <Link href="/about-us">
                      <a className="dropdown-item">
                        <span className="fas fa-info fa-fw " title="About" />
                        {t('header:menu-about-us')}
                      </a>
                    </Link>
                  </div>
                </li>
              </ul>

              <div className="input-group">
               
              </div>

              <ul className="navbar-nav">
                <li className="nav-item dropdown mx-1">
                  <a href="#" className="nav-link dropdown-toggle" data-toggle="dropdown" role="button">
                    <ReactSVG
                      className="flag-icon"
                      src={generateStaticPath('/img/flag/' + ('' + this.props.i18n.language).toLowerCase() + '.svg')}
                    />
                    &nbsp;{('' + this.props.i18n.language).toUpperCase()}
                  </a>
                  <div className="dropdown-menu">
                    {Config.i18n.whitelist.map((countryCode, i) => (
                      <a key={i} className="dropdown-item " onClick={() => this.props.i18n.changeLanguage(countryCode)}>
                        <ReactSVG className="flag-icon" src={generateStaticPath('/img/flag/' + countryCode + '.svg')} />
                        &nbsp;{countryCode.toUpperCase()}
                      </a>
                    ))}
                  </div>
                </li>

                <li className="nav-item mx-1 dropdown">
                  {!(currentUser && currentUser.cif) ? (
                    <React.Fragment>
                      <Link href="/login">
                        <a className="nav-link dropdown-toggle" data-toggle="dropdown" role="button">
                          <div style={currentUser && currentUser.cif ? { display: 'none' } : { display: 'inline' }}>
                            <span className="fas fa-user-times fa-fw" id="guest-user-icon" />
                            {t('header:guest')}
                          </div>
                        </a>
                      </Link>
                      <div className="dropdown-menu dropdown-menu-right">
                        <Link href="/login">
                          <a className="dropdown-item">
                            <div>
                              <span className="fas fa-sign-in-alt fa-fw" id="guest-user-login" />
                              {t('header:menu-fiction-login')}
                            </div>
                          </a>
                        </Link>
                        <Link href="/signup">
                          <a className="dropdown-item">
                            <div>
                              <span className="fas fa-user-plus fa-fw" id="guest-user-signup" />
                              {t('header:menu-fiction-signup')}
                            </div>
                          </a>
                        </Link>
                      </div>
                    </React.Fragment>
                  ) : (
                    <React.Fragment>
                      <Link href="/update-profile">
                        <a className="nav-link dropdown-toggle" data-toggle="dropdown" role="button">
                          <div style={currentUser && currentUser.cif ? { display: 'inline' } : { display: 'none' }} id="login-user-icon">
                            <span className="fas fa-user fa-fw" />
                            <span className="d-lg-none d-xl-inline" style={{ color: '#06f' }}>
                              {this.props.currentUser.displayName}
                            </span>
                          </div>
                        </a>
                      </Link>
                      <div className="dropdown-menu dropdown-menu-right">
                        <Link href="/update-profile">
                          <a className="dropdown-item">
                            <div>
                              <span className="fas fa-user fa-fw " title="Profile" />
                              {t('header:menu-fiction-profile')}
                            </div>
                          </a>
                        </Link>
                        <Link href="/coin-purchase">
                          <a className="dropdown-item">
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
                          }}
                        >
                          <div>
                            <span className="fas fa-sign-out-alt fa-fw " title="Log out" />
                            {t('header:menu-fiction-log-out')}
                          </div>
                        </a>
                      </div>
                    </React.Fragment>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

Header.propTypes = {
  t: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  router: PropTypes.object,
  logout: PropTypes.func,
  searchFiction: PropTypes.func,
  isSessionTimeout: PropTypes.bool,
  i18n: PropTypes.object,
};

const stateToProps = ({ user }) => ({
  currentUser: user.user,
  errorList: user.errorList,
  isSessionTimeout: user.isSessionTimeout,
});
const dispatchToProps = {
  logout,
  searchFiction,
};

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation('header')(Header)));
