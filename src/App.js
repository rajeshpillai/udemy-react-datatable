import React, { Component } from 'react';
import './App.css';
import DataTable from './Components/DataTable';

class App extends Component {
  constructor(props) {
    super(props);

    this.onAddRow = this.onAddRow.bind(this);

    let model = {
      headers: [
        //{title:"Id",accessor: "id", index: 0, dataType: "number"},
        {
          title: "Profile", accessor: "profile", width: "80px", index: 1, cell: {
            type: "image",
            style: {
              "width": "50px",
            }
          }
        },
        { title: "Name", accessor: "name", width: "300px", index: 2, dataType: "string" },
        { title: "Age", accessor: "age", index: 3, dataType: "number" },
        { title: "Qualification", accessor: "qualification", index: 4, dataType: "number" },
        {
          title: "Rating", accessor: "rating", index: 5, width: "200px", cell: row => (
            <div className="rating">
              <div style={{
                backgroundColor: "lightskyblue",
                textAlign: "center",
                height: "1.9em",
                width: (row.rating / 5) * 201 + "px",
                margin: "3px 0 4px 0"
              }}><a href={`/showchart/${row.id}`}>{row.rating}</a></div>
            </div>
          )
        },
      ],
      data: [
        { id: 1, name: "a", age: 29, qualification: "B.Com", rating: 3, profile: "https://png.icons8.com/nolan/50/000000/user.png" },
        { id: 2, name: "b", age: 35, qualification: "B.Sc", rating: 5, profile: "https://png.icons8.com/nolan/50/000000/user.png" },
        { id: 3, name: "c", age: 42, qualification: "B.E", rating: 3, profile: "https://png.icons8.com/nolan/50/000000/user.png" },
      ]
    }

    for (var i = 4; i <= 20; i++) {
      model.data.push({
        id: i,
        name: "name " + i,
        age: i + 18,
        qualification: "Graduate",
        rating: (i % 2 ? 3 : 4),
        profile: "https://png.icons8.com/dotty/50/000000/cat-profile.png"
      })
    }

    this.state = model;

  }


  onUpdateTable = (field, id, value) => {
    let data = this.state.data.slice();
    let updateRow = this.state.data.find((d) => {
      return d["id"] == id;
    });

    updateRow[field] = value;

    this.setState({
      edit: null,
      data: data
    });
  }

  // todo:
  onAddRow() {
    let id = +new Date();
    var newRow = {
      id: id,
      name: "name " + id,
      age: 34,
      qualification: "Graduate",
      rating: 4,
      profile: "https://png.icons8.com/dotty/50/000000/cat-profile.png"
    };


    this.setState({
      data: [newRow, ...this.state.data]
    });
  }


  render() {
    return (
      <div>
        <button onClick={this.onAddRow}>Add random row</button>
        <DataTable className="data-table"
          title="USER PROFILES"
          keyField="id"
          edit={true}
          pagination={{
            enabled: true,
            pageLength: 5,
            type: "long"  // long, short
          }}
          width="100%"
          headers={this.state.headers}
          data={this.state.data}
          noData="No records!"
          onUpdate={this.onUpdateTable} />
      </div>
    );
  }
}

export default App;
