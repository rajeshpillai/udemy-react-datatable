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

    renderTableHeader = () => {
        let {headers} = this.state;
        headers.sort((a,b) => {
            if (a.index > b.index) return 1;
            return -1;
        });

        let headerView = headers.map((header, index) => {
            let title = header.title;
            let cleanTitle = header.accessor;
            let width = header.width;

            return (
                <th key={cleanTitle}
                    ref={(th)=>this.th = th}
                    style={{widht: width}}
                    data-col={cleanTitle}>
                    <span className="header-cell">
                        {title}
                    </span>
                </th>
            );
        });

        return headerView;
    }

    renderTable = () => {
        let title = this.props.title || "DataTable";
        let headerView = this.renderTableHeader();
        let contentView = "Content goes here";

        return (
            <table className="data-inner-table">
                <caption className="data-table-caption">
                    {title}
                </caption>
                <thead>
                    <tr>
                        {headerView}
                    </tr>
                </thead>
                <tbody>
                    {!this.state.data.length && this.noData}
                    {this.state.data && contentView}
                </tbody>
            </table>
        );
    }
    render() {
        return (
            <div className={this.props.className}>
                {this.renderTable()}
            </div>
        )
    }
}