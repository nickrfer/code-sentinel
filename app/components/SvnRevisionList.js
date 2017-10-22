// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import path from 'path';
import util from 'util';
import _ from 'lodash';
import dateFormat from 'dateformat';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import moment from 'moment';
import { Diff2Html, Diff2HtmlUI } from 'diff2html';
import DiffSvn2Git from 'diffsvn2git';
import ReactHtmlParser from 'react-html-parser';
import { array, boolean, func, date } from 'prop-types';
import { lstatSync, readdirSync } from 'fs';
import { join } from 'path';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-select/dist/react-select.css';
import styles from './SvnRevisionList.css';

const isDirectory = source => lstatSync(source).isDirectory();
const getDirectories = source =>
  readdirSync(source).map(name => join(source, name)).filter(isDirectory);

const repoRoot = 'repos/';
let diffSvn2Git;

export default class SvnRevisionList extends Component {

  propTypes: {
    startRevisionLoading: func.isRequired
  };

  state: {
    revisions: array,
    revisionDate: date,
    repositorySelected: string,
    repositoryFolders: array,
    onRevisionDateChanged: func.isRequired,
    startRevisionLoading: func.isRequired,
    selectedRevision: string,
    prettyDiffHtml: string,
    diffOutputFormat: string
  };

  constructor(props) {
    super(props);
    this.state = {
      revisions: [],
      repositoryFolders: createRepositoryFolders(),
      revisionDate: moment(),
      diffOutputFormat: 'side-by-side',
      prettyDiffHtml: ''
    };
  }

  createRepositoryFolders() {
    let directories = getDirectories(repoRoot);
    console.log('#directories: ' + directories);

    let folderOptions = [];
    directories.forEach(dir => {
      folderOptions.push({ value: dir, label: dir });
    });
    return folderOptions;
  }

  componentWillMount() {
    this.fetchRevisionList(this.state.revisionDate);
  }

  fetchRevisionList(dateChanged: date) {
    if (moment(dateChanged, 'DD/MM/YYYY').isValid() && repositorySelected) {
      this.setState({ revisions: [] });

      this.props.startRevisionLoading(true);
      const self = this;

      const revisionDateFormated = dateChanged.format('YYYY-MM-DD');

      createDiffSvn2Git();

      diffSvn2Git.listRevisionsByDate(revisionDateFormated).then((loadedRevisions) => {
        self.setState({ revisions: loadedRevisions, prettyDiffHtml: '' });
        this.props.startRevisionLoading(false);
      });
      self.setState({ revisionDate: dateChanged });
    }
    self.setState({ repositoryFolders: createRepositoryFolders() });
  }

  createDiffSvn2Git() {
    const workingPath = path.resolve(repoRoot + repositorySelected);
    console.log('#workingPath: ', workingPath);
    diffSvn2Git = new DiffSvn2Git({ cwd: workingPath });
  }

  generateDiffTest(revisionSelected) {
    this.props.startRevisionLoading(true);
    console.log('revisionSelected:', revisionSelected.trim());

    diffSvn2Git.parse(revisionSelected.trim()).then((patch) => {
      console.log('Patch result: ');
      console.log(patch);

      const diff2HtmlConfig = { inputFormat: 'diff',
        outputFormat: this.state.diffOutputFormat,
        showFiles: true,
        matching: 'words',
        synchronisedScroll: true
      };

      console.log('Diff2Html result: ');
      const diff2HtmlResult = Diff2Html.getPrettyHtml(patch, diff2HtmlConfig);

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
          <i className="material-icons">{ this.state.selectedRevision == revision.$.revision ? 'label-outline' : 'label' }</i>
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
          required
        />
        <Select
          name="repositorySelect"
          value={this.state.repositorySelected}
          options={this.state.repositoryFolders}
          onChange={this.fetchRevisionList.bind(this)}
          required
        />
        <a className="btn" href="#" onClick={() => this.fetchRevisionList(this.state.revisionDate) } 
          disabled={this.state.revisionDate == null}
          style={{marginLeft: '1rem'},{width: '0.1em'},{paddingLeft: '1rem'}}> 
          <i className="material-icons">refresh</i>
        </a>
        <ul>
          {rows}
        </ul>
        <div className="diff-container" dangerouslySetInnerHTML={{__html: this.state.prettyDiffHtml}}></div>
      </div>
    );
  }

}
