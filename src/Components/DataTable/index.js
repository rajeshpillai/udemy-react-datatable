import React from 'react';
import './datatable.css';

export default class DataTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            headers: props.headers,
            data: props.data
        }

        this.keyField = props.keyField || "id"; // TODO: revisit this logic
        this.noData = props.noData || "No records found!";
        this.width = props.width || "100%";
    }
    render() {
        return (
            <div>DATATABLE</div>
        )
    }
}