/* eslint-disable no-undef */
import React from 'react';

const EthereumModal = translate => {
  const t = translate.translate;
  return t && typeof t === 'function' ? (
    <div className="modal fade" id="eth_modal" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0">
          <div className="modal-body">{t('chapter:creating-ethereum')}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" data-dismiss="modal">
              {t('common:report.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div />
  );
};

export default EthereumModal;
