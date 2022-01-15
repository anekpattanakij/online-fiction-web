import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { withTranslation } from '../i18n';
import { connect } from 'react-redux';
import { withRouter } from 'next/router';
import { API_CALLING_METHOD, callNonSecureApi, callSecureApi, RETURN_CODE_API_CALL_SUCCESS } from '../common/ApiPortal';
import ReactSVG from 'react-svg';
import { generateStaticPath } from '../util/staticPathUtil';
import { Link } from '../i18n';
import Config from '../config/index';
import { sessionTimeout, updateAccessToken } from '../redux-saga/action/userAction';
import * as moment from 'moment';

class ChapterComment extends React.Component {
  state = {
    commentPosting: false,
    commentSuccess: false,
    commentErrorList: [],
    commentList: [],
    commentValue: '',
  };

  constructor(props) {
    super(props);
    this.submitComment = this.submitComment.bind(this);
    this.handleCommentValueChange = this.handleCommentValueChange.bind(this);
  }

  // eslint-disable-next-line no-unused-vars
  static async getInitialProps({ req, query }) {
    let currentChapter = null;
    let commentList = [];
    await callNonSecureApi(Config.apiPath + '/chapter/' + query['chapter-comment'], API_CALLING_METHOD.GET).then(chapterResponse => {
      if (chapterResponse.result === RETURN_CODE_API_CALL_SUCCESS && chapterResponse.data) {
        currentChapter = chapterResponse.data;
      }
    });
    await callNonSecureApi(Config.apiPath + '/chapter/' + query['chapter-comment'] + '/comment', API_CALLING_METHOD.GET).then(
      commentListResponse => {
        if (commentListResponse.result === RETURN_CODE_API_CALL_SUCCESS && commentListResponse.data) {
          commentList = commentListResponse.data.result;
        }
      },
    );
    return {
      currentChapter: currentChapter,
      commentList: commentList,
      namespacesRequired: ['common', 'chapter-comment'],
    };
  }

  submitComment(event) {
    event.preventDefault();
    if (this.state.commentValue.length > 0) {
      this.setState({ commentPosting: true, commentSuccess: false, commentErrorList: [] });
      callSecureApi(
        this.props.sessionTimeout,
        this.props.updateAccessToken,
        this.props.currentUser,
        Config.apiPath + '/chapter/' + this.props.router.query['chapter-comment'] + '/comment',
        API_CALLING_METHOD.POST,
        {},
        { comment: this.state.commentValue },
      ).then(chapterResponse => {
        if (chapterResponse.result === RETURN_CODE_API_CALL_SUCCESS) {
          let newRunningNumber = 1;
          this.state.commentList.map(commentItem => {
            if (commentItem.runningNumber && commentItem.runningNumber >= newRunningNumber) {
              newRunningNumber = commentItem.runningNumber + 1;
            }
          });
          let newCommentList = [
            {
              comment: this.state.commentValue,
              userCif: this.props.currentUser.cif,
              userDisplayName: this.props.currentUser.displayName,
              runningNumber: newRunningNumber,
              commentDate: new Date(),
            },
          ];
          newCommentList.push(...this.state.commentList);
          this.setState({ commentPosting: false, commentSuccess: true, commentValue: '', commentList: newCommentList });
        } else {
          this.setState({ commentErrorList: [chapterResponse.data] });
        }
      });
    }
  }
  componentDidMount() {
    this.setState({ commentList: this.props.commentList });
  }

  handleCommentValueChange(event) {
    this.setState({ commentValue: event.target.value });
  }

  render() {
    const { t } = this.props;
    return !this.props.currentChapter ? (
      <div className="alert alert-danger text-center mt-2" role="alert">
        <strong>{t('chapter-comment:ERROR_CHAPTER_NOT_FOUND')}</strong>
      </div>
    ) : (
      <React.Fragment>
        <Helmet title={this.props.currentChapter.chapterName + t('chapter-comment:title')} />
        <div className="container" role="main" id="content">
          <div className="container" role="main" id="content">
            <div className="card mb-3">
              <h6 className="card-header">
                <span className="fas fa-book fa-fw "></span>
                <Link
                  href={'/fiction?fiction=' + this.props.currentChapter.fictionId}
                  as={'/fiction/' + this.props.currentChapter.fictionId + '/' + this.props.currentChapter.fictionDisplayName}
                >
                  <a className="manga_title " title="Between Two Lips">
                    {this.props.currentChapter && this.props.currentChapter.fictionDisplayName}
                  </a>
                </Link>{' '}
              </h6>
            </div>

            <div className="card mb-3">
              <h6 className="card-header text-truncate">
                <span className="far fa-file fa-fw "></span>
                <Link
                  href={'/chapter?chapter=' + this.props.currentChapter.chapterId}
                  as={'/chapter/' + this.props.currentChapter.chapterId + '/' + this.props.currentChapter.chapterName}
                >
                  <a className="text-truncate">
                    {this.props.currentChapter && this.props.currentChapter.displayChapterNumber === 0 ? (
                      t('chapter-comment:special-chapter')
                    ) : (
                      <React.Fragment>
                        {t('chapter-comment:short-chapter')} {this.props.currentChapter && this.props.currentChapter.displayChapterNumber}
                      </React.Fragment>
                    )}
                    {this.props.currentChapter && this.props.currentChapter.chapterName}
                    <ReactSVG
                      className="flag-icon ml-1"
                      src={generateStaticPath('/img/flag/' + ('' + this.props.currentChapter.language).toLowerCase() + '.svg')}
                    />
                  </a>
                </Link>
              </h6>
              <div className="card-body">
                {this.state.commentErrorList && this.state.commentErrorList.length > 0 ? (
                  <div className="alert alert-danger" role="alert">
                    <ul>
                      {this.state.commentErrorList.map((errorItem, errorKey) => (
                        <li key={errorKey}>{t('common:error.' + errorItem.code)}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  ''
                )}

                {this.state.commentSuccess ? (
                  <div className="alert alert-success alert-dismissible fade show text-center" role="alert">
                    {t('chapter-comment:post-success')}
                  </div>
                ) : (
                  ''
                )}

                {!this.props.currentUser ? (
                  <p className="text-center">{t('chapter-comment:need-login')}</p>
                ) : (
                  <form id="post_reply_form" onSubmit={this.submitComment}>
                    <div className="form-group">
                      <div className="col-xs-12">
                        <textarea
                          rows="5"
                          type="text"
                          className="form-control"
                          id="text"
                          name="text"
                          placeholder={t('chapter-comment:comment-placeholder')}
                          value={this.state.commentValue}
                          onChange={this.handleCommentValueChange}
                        ></textarea>
                      </div>
                    </div>
                    <div className="row justify-content-between">
                      <div className="col-auto order-2">
                        <button type="submit" className="btn btn-secondary" id="post_reply_button">
                          <span className="far fa-comment fa-fw "></span> {t('chapter-comment:comment')}
                        </button>
                      </div>
                      <div className="col-auto order-1">
                        {this.props.currentChapter && this.props.currentChapter.chapterId ? (
                          <Link
                            href={'/chapter?chapter=' + this.props.currentChapter.chapterId}
                            as={'/chapter/' + this.props.currentChapter.chapterId}
                          >
                            <a role="button" title="Back to chapter" className="btn btn-secondary">
                              <span className="fas fa-undo fa-fw "></span>
                              {t('chapter-comment:back')}
                            </a>
                          </Link>
                        ) : (
                          ''
                        )}
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
            <table className="table table-striped">
              <tbody>
                {this.state.commentList &&
                  this.state.commentList.map((commentItem, commentKey) => (
                    <tr className="post" key={'comment-' + commentKey}>
                      <td style={{ maxWidth: '200px', width: '120px' }} className="text-center d-none d-md-table-cell">
                        <div style={{ textAlign: 'left', lineHeight: '0.9rem' }}>
                          <span style={{ overflowWrap: 'break-word' }}>
                            <Link href={'/user?user=' + commentItem.userCif} as={'/user/' + commentItem.userCif}>
                              <a style={{ color: '#099' }}>{commentItem.userDisplayName} </a>
                            </Link>
                          </span>
                          <br />
                        </div>
                      </td>
                      <td className="pb-3">
                        <div className="d-md-none d-lg-none d-xl-none mb-2">
                          <span className="fas fa-user fa-fw "></span>{' '}
                          <Link href={'/user?user=' + commentItem.userCif} as={'/user/' + commentItem.userCif}>
                            <a style={{ color: '#099' }}>{commentItem.userDisplayName} </a>
                          </Link>
                        </div>
                        <span title="2019-08-08 20:36:39 UTC" className="float-right">
                          <span className="far fa-clock fa-fw "></span> {moment(commentItem.commentDate).fromNow()}{' '}
                        </span>
                        <div style={{ minHeight: '20px' }} className="postbody mb-3 mt-4">
                          {commentItem.comment}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

ChapterComment.propTypes = {
  t: PropTypes.func.isRequired,
  router: PropTypes.object,
  currentUser: PropTypes.object,
  errorList: PropTypes.array,
  currentChapter: PropTypes.object,
  commentList: PropTypes.array,
  sessionTimeout: PropTypes.func,
  updateAccessToken: PropTypes.func,
};

const stateToProps = ({ user }) => ({
  currentUser: user.user,
  errorList: user.errorList,
  isSessionTimeout: user.isSessionTimeout,
  loading: user.loading,
});
const dispatchToProps = { sessionTimeout, updateAccessToken };

export default connect(
  stateToProps,
  dispatchToProps,
)(withRouter(withTranslation(['common', 'chapter-comment'])(ChapterComment)));
