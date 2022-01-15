/* eslint-disable react/prop-types */
import { ContentState, convertFromHTML, convertFromRaw, Editor, EditorState, RichUtils } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import * as React from 'react';
import PropTypes from 'prop-types';

class SimpleEditor extends React.Component {
  constructor(props) {
    super(props);
    let state = null;
    if (props && props.value) {
      const blocksFromHTML = convertFromHTML(props.value);
      state = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);
    }

    this.state = {
      editorState: EditorState.createWithContent(state ? state : emptyContentState),
      initial: false,
    };
    this.onChange = editorState => {
      if (props.onChange) {
        props.onChange(stateToHTML(editorState.getCurrentContent()));
      }
      this.setState({ editorState });
    };
    this.handleKeyCommand = command => this._handleKeyCommand(command);
    this.toggleBlockType = type => this._toggleBlockType(type);
    this.toggleInlineStyle = style => this._toggleInlineStyle(style);
  }

  componentDidUpdate() {
    if (this.props.value && !this.value && !this.state.initial) {
      const blocksFromHTML = convertFromHTML(this.props.value);
      const state = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks, blocksFromHTML.entityMap);

      this.setState({
        editorState: EditorState.createWithContent(state && this.props.value !== '<p><br></p>' ? state : emptyContentState),
        initial: true,
      });
    }
  }

  _handleKeyCommand(command) {
    const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _toggleBlockType(blockType) {
    this.onChange(RichUtils.toggleBlockType(this.state.editorState, blockType));
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, inlineStyle));
  }

  render() {
    let className = 'RichEditor-editor';
    const editorState = this.state.editorState;
    const contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) {
      if (
        contentState
          .getBlockMap()
          .first()
          .getType() !== 'unstyled'
      ) {
        className += ' RichEditor-hidePlaceholder';
      }
    }
    return (
      <div className="RichEditor-root writeContentArea" style={{ border: '1px solid #ced4da', borderRadius: '.25rem' }}>
        <BlockStyleControls editorState={editorState} onToggle={this.toggleBlockType} />
        <InlineStyleControls editorState={editorState} onToggle={this.toggleInlineStyle} />
        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            placeholder={this.props.placeholder ? this.props.placeholder : ''}
            spellCheck={true}
            editorKey="formKey"
          />
        </div>
      </div>
    );
  }
}

const emptyContentState = convertFromRaw({
  entityMap: {},
  blocks: [
    {
      text: '',
      key: 'formKey',
      type: 'unstyled',
      entityRanges: [],
    },
  ],
});

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"',
    fontSize: 16,
    padding: 2,
  },
};

const getBlockStyle = block => {
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote';
    default:
      return null;
  }
};

// tslint:disable-next-line:max-classes-per-file
class StyleButton extends React.Component {
  constructor(props) {
    super(props);
    this.onToggle = e => {
      e.preventDefault();
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    );
  }
}

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'H5', style: 'header-five' },
  { label: 'H6', style: 'header-six' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'UL', style: 'unordered-list-item' },
  { label: 'OL', style: 'ordered-list-item' },
  { label: 'Code Block', style: 'code-block' },
];

const BlockStyleControls = props => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map(type => (
        <StyleButton key={type.label} active={type.style === blockType} label={type.label} onToggle={props.onToggle} style={type.style} />
      ))}
    </div>
  );
};

const INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Monospace', style: 'CODE' },
];

const InlineStyleControls = props => {
  const currentStyle = props.editorState.getCurrentInlineStyle();
  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map(type => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};

SimpleEditor.propTypes = {
  value: PropTypes.string,
  onToggle: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

StyleButton.propTypes = {
  value: PropTypes.string,
  onToggle: PropTypes.func,
  style: PropTypes.string,
  active: PropTypes.bool,
  label: PropTypes.string,
};

export default SimpleEditor;
