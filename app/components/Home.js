// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from 'react-loaders';
import SvnRevisionList from './SvnRevisionList';
import styles from './Home.css';

export default class Home extends Component {

  state: {
    loading: boolean
  };

  constructor(props: any) {
    super(props);
    this.state = {
      loading: true
    };
  }

  startRevisionLoading(isLoading: boolean) {
    this.setState({ loading: isLoading });
  }

  render() {
    return (
      <div>
        <div className="loader-container" key="loader">
          <Loader type="pacman" active={this.state.loading} size="lg" />
        </div>
        <div className={styles.container} style={this.state.loading ? { display: 'none' } : { }} data-tid="container" key="home-container">
          <SvnRevisionList
            startRevisionLoading={(isLoading) => this.startRevisionLoading(isLoading)}
          />
        </div>
      </div>
    );
  }
}
