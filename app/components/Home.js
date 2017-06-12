// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import SvnRevisionList from './SvnRevisionList';
import styles from './Home.css';

export default class Home extends Component {
  render() {
    return (
      <div>
        <div className={styles.container} data-tid="container">
          <h2>Home</h2>
          <SvnRevisionList />
          <Link to="/counter">to Counter</Link>
        </div>
      </div>
    );
  }
}
