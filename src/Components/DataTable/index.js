import React from 'react';
import ReactDOM from 'react-dom';
import './datatable.css';
import Pagination from '../Pagination';

export default class DataTable extends React.Component {
    _preSearchData = null

    constructor(props) {
        super(props);

        this.state = {
            headers: props.headers,
            data: props.data,
            pagedData: props.data,
            sortby: null,
            descending: null,
            search: false,
            pageLength: this.props.pagination.pageLength || 5,
            currentPage: 1,
        }

        this.keyField = props.keyField || "id"; // TODO: revisit this logic
        this.noData = props.noData || "No records found!";
        this.width = props.width || "100%";

        // Add pagination support
        this.pagination = this.props.pagination || {};
    }

    onDragOver = (e) => {
        e.preventDefault();
    }

    onDragStart = (e, source) => {
        e.dataTransfer.setData('text/plain', source);
    }

    onDrop = (e, target) => {
        e.preventDefault();
        let source = e.dataTransfer.getData('text/plain');
        let headers = [...this.state.headers];
        let srcHeader = headers[source];
        let targetHeader = headers[target];

        let temp = srcHeader.index;
        srcHeader.index = targetHeader.index;
        targetHeader.index = temp;

        this.setState({
            headers
        });
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

            if (this.state.sortby === index) {
                title += this.state.descending ? '\u2193': '\u2191';
            }

            return (
                <th key={cleanTitle}
                    ref={(th)=>this[cleanTitle] = th} 
                    style={{width: width}}
                    data-col={cleanTitle}
                    onDragStart={(e)=>this.onDragStart(e, index)}
                    onDragOver={this.onDragOver}
                    onDrop={(e)=>{this.onDrop(e, index)}}>
                    <span draggable data-col={cleanTitle} className="header-cell">
                        {title}
                    </span>
                </th>
            );
        });

        return headerView;
    }

    renderNoData = () => {
        return (
            <tr>
                <td colSpan={this.props.headers.length}>
                    {this.noData}
                </td>
            </tr>
        );
    }

    onUpdate = (e) => {
        e.preventDefault();
        let input = e.target.firstChild;
        let header = this.state.headers[this.state.edit.cell];
        let rowId = this.state.edit.rowId;

        this.setState({
            edit: null
        });

        this.props.onUpdate &&
            this.props.onUpdate(header.accessor, rowId, input.value);
    }

    onFormReset = (e) =>{
        if (e.keyCode === 27) {  // ESC key
            this.setState({
                edit: null
            });
        }
    }

    renderContent = () => {
        let {headers} = this.state;
        let data = this.pagination ? this.state.pagedData
                    : this.state.data;

        let contentView = data.map((row, rowIdx) => {
            let id = row[this.keyField];
            let edit = this.state.edit;

            let tds = headers.map((header, index) => {
                let content = row[header.accessor];
                let cell = header.cell;
                if (cell) {
                    if (typeof(cell) === "object") {
                        if (cell.type === "image" && content) {
                            content = <img style={cell.style} src={content}  />
                        } 
                    } else if (typeof(cell) === "function") {
                        content = cell(row);
                    }
                }

                if (this.props.edit) {
                    if (header.dataType && (header.dataType === "number" ||
                            header.dataType === "string") &&
                            header.accessor !== this.keyField) {
                            if (edit && edit.row === rowIdx && edit.cell === index) {
                                content = (
                                    <form onSubmit={this.onUpdate}>
                                        <input type="text" defaultValue={content}
                                          onKeyUp={this.onFormReset} />
                                    </form>
                                );
                            }

                        }
                }

                return (
                    <td key={index} data-id={id} data-row={rowIdx}>
                        {content}
                    </td>
                );
            });
            return (
                 <tr key={rowIdx}>
                     {tds}
                 </tr>
             );
        });
        return contentView;
    }
    
    onSort = (e) => {
        let data = this.state.data.slice(); // Give new array
        let colIndex = ReactDOM.findDOMNode(e.target).parentNode.cellIndex;
        let colTitle = e.target.dataset.col;
        
        let descending = !this.state.descending;

        data.sort((a,b) => {
            let sortVal = 0;
            if (a[colTitle] < b[colTitle]) {
                sortVal = -1;
            } else if (a[colTitle] > b[colTitle]) {
                sortVal = 1;
            }
            if (descending) {
                sortVal = sortVal * -1;
            }
            return sortVal;
        });

        this.setState({
            data,
            sortby: colIndex,
            descending
        }, () =>{
            this.onGotoPage(this.state.currentPage);
        });
    }

    onSearch = (e) => {
        let {headers} = this.state;
        // Grab the index of the target column
        let idx = e.target.dataset.idx;

        // Get the target column
        let targetCol = this.state.headers[idx].accessor;

        let data = this._preSearchData;

        // Filter the records
        let searchData = this._preSearchData.filter((row) => {
            let show = true;

            for (let field in row) {
                let fieldValue = row[field];
                let inputId = 'inp' + field;
                let input = this[inputId];
                if (!fieldValue === '') {
                    show = true;
                } else {
                    show = fieldValue.toString().toLowerCase().indexOf(input.value.toLowerCase()) > -1;
                    if (!show) break;
                }
            }
            return show;
            //return row[targetCol].toString().toLowerCase().indexOf(needle) > -1;
        });

        // UPdate the state
        this.setState({
            data: searchData,
            pagedData: searchData,
            totalRecords: searchData.length
        }, ()=>{
            if (this.pagination.enabled) {
                this.onGotoPage(1);
            }
        });
    }

    renderSearch = () => {
        let {search, headers} = this.state;
        if (!search) {
            return null;
        }

        let searchInputs = headers.map((header, idx) => {
            
            // Get the header ref.
            let hdr = this[header.accessor];
            let inputId = 'inp' + header.accessor;

            return (
                <td key={idx}>
                    <input type="text"
                       ref={(input)=>this[inputId] = input}
                        style={{
                            width: hdr.clientWidth-17 + "px"
                        }}
                        data-idx = {idx}
                      />
                </td>
            );

        });

        return (
            <tr onChange={this.onSearch}>
                {searchInputs}
            </tr>
        );
    }

    onShowEditor = (e) => {
        let id = e.target.dataset.id;
        this.setState({
            edit: {
                row: parseInt(e.target.dataset.row, 10),
                rowId: id,
                cell: e.target.cellIndex
            }
        })
    }

    renderTable = () => {
        let title = this.props.title || "DataTable";
        let headerView = this.renderTableHeader();
        let contentView = this.state.data.length > 0 
                        ? this.renderContent() 
                        : this.renderNoData();

        return (
            <table className="data-inner-table">
                <caption className="data-table-caption">
                    {title}
                </caption>
                <thead onClick={this.onSort}>
                    <tr>
                        {headerView}
                    </tr>
                </thead>
                <tbody onDoubleClick={this.onShowEditor}>
                    {this.renderSearch()}
                    {contentView}
                </tbody>
            </table>
        );
    }

    onToggleSearch = (e) => {
        if (this.state.search) {
            this.setState({
                data: this._preSearchData,
                search: false
            });
            this._preSearchData = null;
        } else {
            this._preSearchData = this.state.data;
            this.setState({
                search: true
            });
        }
    }

    renderToolbar = () => {
        return (
            <div className="toolbar">
                <button onClick={this.onToggleSearch}>
                    Search
                </button>
            </div>

        );
    }

    getPagedData = (pageNo, pageLength) => {
        let startOfRecord = (pageNo - 1) * pageLength;
        let endOfRecord = startOfRecord + pageLength;

        let data = this.state.data;
        let pagedData = data.slice(startOfRecord, endOfRecord);

        return pagedData;
    }

    onPageLengthChange = (pageLength) => {
        this.setState({
            pageLength: parseInt(pageLength, 10)
        },()=> {
            this.onGotoPage(this.state.currentPage);
        });
    }

    onGotoPage = (pageNo) => {
        let pagedData = this.getPagedData(pageNo, this.state.pageLength);
        this.setState({
            pagedData: pagedData,
            currentPage: pageNo
        });
    }

    componentDidMount() {
        if (this.pagination.enabled) {
            this.onGotoPage(this.state.currentPage);
        }
    }

    render() {
        return (
            <div className={this.props.className}>
                {this.pagination.enabled &&
                
                <Pagination
                    type={this.props.pagination.type}
                    totalRecords = {this.state.data.length}
                    pageLength = {this.state.pageLength}
                    onPageLengthChange={this.onPageLengthChange}
                    onGotoPage = {this.onGotoPage}
                    currentPage={this.state.currentPage}
                 />
                }
                {this.renderToolbar()}
                {this.renderTable()}
            </div>
        )
    }
}