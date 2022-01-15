import React from 'react';

const ReportModal = translate => {
  const t = translate.translate;
  return t && typeof t === 'function' ? (
    <div className="modal" id="modal-report" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title" id="modal-report-label">
              <span className="fas fa-flag fa-fw"  title="" />
              {t('common:report.title')}
            </h4>
            <button type="button" className="close" data-dismiss="modal">
              <span >×</span>
            </button>
          </div>
          <form id="chapter-report-form" className="form-horizontal">
            <div className="modal-body">
              <div className="form-group row">
                <label htmlFor="type_id" className="col-sm-3 col-form-label">
                  {t('common:report.reason')}
                </label>
                <div className="col-sm-9">
                  <select required="" title={t('common:report.select_reason')} className="form-control" name="type_id">
                    <option value="1">{t('common:report.inappropriate_content')}</option>
                    <option value="2">{t('common:report.copyright_infringement')} </option>
                    <option value="0">{t('common:report.other')}</option>
                  </select>
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="info" className="col-sm-3 col-form-label">
                  {t('common:report.explanation')}
                </label>
                <div className="col-sm-9">
                  <textarea className="form-control" name="info" placeholder={t('common:report.optional')} />
                </div>
              </div>
              <div className="form-group row">
                <div className="col-lg-offset-3 col-sm-9" />
              </div>
              <div className="alert-container" />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-dismiss="modal">
                <span className="fas fa-undo fa-fw"  title="" />
                {t('common:report.close')}
              </button>
              <button type="submit" className="btn btn-warning loading-container" id="chapter-report-submit">
                <span className="d-not-loading">
                  <span className="fas fa-flag fa-fw" /> {t('common:report.submit')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : (
    <div />
  );
};

export default ReportModal;
