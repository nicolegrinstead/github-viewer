import React, { Component } from 'react';
import GitHub from 'github-api';
import logo from './octocat.jpg';
import './App.css';

class App extends Component {

  constructor(props) { 
    super(props);
    this.handleOrganizationChange = this.handleOrganizationChange.bind(this);
    this.searchOrganization = this.searchOrganization.bind(this);
    this.state = {repos: [], commits: [], currentRepo: '', orgErrorMessage: '', organization: ''};
  }

  handleOrganizationChange(e) {
    this.setState({repos: [], organization: e.target.value});
  }

  searchOrganization(e) {
    this.setState({repos: [], commits: [], orgErrorMessage: ''});
    e.preventDefault();
    const gh = new GitHub();
    var organization = gh.getOrganization(this.state.organization);
    organization.getRepos().then((result) => {
      var repos = result.data.map((repo, i)=>{repo.id = i; return repo});
      repos.sort(function (a, b) {
        return new Date(b.updated_at) - new Date(a.updated_at);
      });
      this.setState({repos: repos});
    }).catch(() => {
      this.setState({orgErrorMessage: "We couldn't find that organizatoin ¯\\_(ツ)_/¯ "}) 
    });
  }

  viewCommits(repoInfo){ 
    this.setState({repos: [], currentRepo: repoInfo.owner.login+"/"+repoInfo.name});
    const gh = new GitHub();
    var repo = gh.getRepo(repoInfo.owner.login, repoInfo.name);
    repo.listCommits().then(
      (result) => {
        var commits = result.data.map((commit, i)=>{commit.id = i; return commit});
        this.setState({commits: commits});
      }
    );
  }

  render() {
    let commitList = this.state.commits.length > 0 ? <CommitList repo={this.state.currentRepo} commits={this.state.commits} /> : null;
    let repoList = this.state.repos.length > 0 ? <RepoList repos={this.state.repos} onClick={this.viewCommits.bind(this)} org={this.state.organization}/> : null;

    return (
      <div>
        <div className="AppHeader">
          <img src={logo} className="AppLogo" alt="octocat" />
          <h2>GitHub Organization Search</h2>
        </div>
        <div className="SearchBox">
          <form onSubmit={this.searchOrganization}>
            <label className="SearchField Label">Find Repos in an Organization:</label>
            <input className="SearchField Input" onChange={this.handleOrganizationChange} value={this.state.organization} />
            <button className="SearchField Input">Search</button>
          </form>
        </div>
        <div className="Results">
          <p>{this.state.orgErrorMessage}</p>
          {repoList}
          {commitList}
        </div>
      </div>
    );
  }
}

function RepoList(props){ 
  const repos = props.repos;
  return (
    <div>
      <h4>Repos from {props.org}: </h4>
      <ul className="List">
        {repos.map(repo => (
          <li className="RepoListItem" key={repo.id}>
            <a href={"/commit/#"+repo.name} title={"View Commits for "+repo.name} onClick={(e) => {e.preventDefault(); props.onClick(repo);}}> {repo.name} </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CommitList(props){ 
  const commits = props.commits;
  return (
    <div>
      <h4>Recent Commits for {props.repo}:</h4>
      <ul className="List">
        {commits.map(commit => (
          <li className="CommitListItem" key={commit.id}>
            <p className="CommitDetails"><b>Commit message:</b> {commit.commit.message}</p>
            <Author commit={commit}/>
            <Committer commit={commit}/>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Author(props){ 
  const commit = props.commit.commit;
  if (commit.author){ 
    return <p className="CommitDetails"><b>Authored by:</b> {commit.author.name} On: {commit.author.date}</p>;
  } else { 
    return null;
  }
}

function Committer(props){ 
  const commit = props.commit.commit;
  if (commit.committer){ 
    return <p className="CommitDetails"><b>Commited by:</b> {commit.committer.name} On: {commit.committer.date}</p>;
  } else { 
    return null;
  }
}

export default App;
