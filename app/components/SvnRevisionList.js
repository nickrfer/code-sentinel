// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import path from 'path';
import util from 'util';
import _ from 'lodash';
import dateFormat from 'dateformat';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { Diff2Html, Diff2HtmlUI } from 'diff2html';
import DiffSvn2Git from 'diffsvn2git';
import ReactHtmlParser from 'react-html-parser';
import { array, boolean, func, date } from 'prop-types';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './SvnRevisionList.css';

const workingPath = path.resolve('tmp/repo');
const diffSvn2Git = new DiffSvn2Git({ cwd: workingPath });

export default class SvnRevisionList extends Component {

  propTypes: {
    startRevisionLoading: func.isRequired
  };

  state: {
    revisions: array,
    revisionDate: date,
    onRevisionDateChanged: func.isRequired,
    startRevisionLoading: func.isRequired,
    prettyDiffHtml: string
  };

  constructor(props) {
    super(props);
    this.state = {
      revisions: [],
      revisionDate: moment('13/04/2015', 'DD/MM/YYYY'),
      prettyDiffHtml: ''
    };
  }

  componentWillMount() {
    this.fetchRevisionList(this.state.revisionDate);
  }

  fetchRevisionList(dateChanged: date) {
    if (moment(dateChanged, 'DD/MM/YYYY').isValid()) {
      this.setState({ revisions: [] });

      this.props.startRevisionLoading(true);
      const self = this;

      const revisionDateFormated = dateChanged.format('YYYY-MM-DD');

      diffSvn2Git.listRevisionsByDate(revisionDateFormated).then((loadedRevisions) => {
        self.setState({ revisions: loadedRevisions, prettyDiffHtml: '' });
        this.props.startRevisionLoading(false);
      });
      self.setState({ revisionDate: dateChanged });
    }
  }

  generateDiffTest(revisionSelected) {
    this.props.startRevisionLoading(true);
    console.log('revisionSelected:', revisionSelected.trim());
    diffSvn2Git.parse(revisionSelected.trim()).then((patch) => {
      console.log('Patch result: ');

      const diff2HtmlConfig = { inputFormat: 'diff',
        outputFormat: 'side-by-side',
        showFiles: true,
        matching: 'words',
        synchronisedScroll: true
      };

      console.log('Diff2Html result: ');
      const diff2HtmlResult = Diff2Html.getPrettyHtml(patch, diff2HtmlConfig);
      console.log(diff2HtmlResult);

      this.setState({ prettyDiffHtml: diff2HtmlResult });
      this.props.startRevisionLoading(false);
    });
  }

  createItem(rows: Array<any>, revision: Object) {
    rows.push(
      <li key={revision.$.revision}>
        <div
          style={styles.fileName}
        >
          <i className="material-icons">label</i>
          <p role="button" onClick={() => this.generateDiffTest(revision.$.revision)}>
            {`r${revision.$.revision} | ${dateFormat(revision.date, 'dd/mm/yyyy HH:MM:ss')} | ${revision.author} | ${revision.msg}`}
          </p>
        </div>
      </li>
    );
  }

  render() {
    const rows = [];

    this.state.revisions.forEach(revisionList => {
      if (util.isArray(revisionList)) {
        revisionList.forEach(revision => {
          this.createItem(rows, revision);
        });
      } else {
        this.createItem(rows, revisionList);
      }
    });

    return (
      <div>
        <DatePicker
          todayButton={'Today'}
          dateFormat="DD/MM/YYYY"
          selected={this.state.revisionDate}
          onChange={this.fetchRevisionList.bind(this)}
          isClearable
        />
        <ul>
          {rows}
        </ul>
        <div className="diff-container" dangerouslySetInnerHTML={{ __html: this.state.prettyDiffHtml }} />
      </div>
    );
  }

}
