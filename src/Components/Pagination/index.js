import React, {Fragment, Component } from 'react';
import './pagination.css';

export default class Pagination extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: props.currentPage || 1
        }
        
    }

    onPageLengthChange = (e) => {
        this.props.onPageLengthChange(this.pageLengthInput.value);
    }

    onPrevPage = (e) => {
        if (this.state.currentPage === 1) return;
        this.onGotoPage(this.state.currentPage - 1);
    }

    onNextPage = (e) => {
        if (this.state.currentPage > this.pages - 1) return;
        this.onGotoPage(this.state.currentPage + 1);
    }

    onGotoPage = (pageNo) => {
        if (pageNo === this.state.currentPage) {
            return;
        }
        if (this.currentPageInput) {
            this.currentPageInput.value = pageNo;
        }

        this.setState({
            currentPage: pageNo
        });

        this.props.onGotoPage(pageNo);
    }
      
    _getPaginationButtons = (text) => {
        let classNames = 'pagination-btn';
        
        // May need refactor
        if (this.state.currentPage == text) {
            classNames += ' current-page';
        }

        let html = (
            <button key={`btn-${text}`}
                id={`btn-${text}`}
                className={classNames}
                onClick={(e)=>{this.onGotoPage(text)}}
            >{text}
            </button>
        );
        return html;
    }

    onCurrentPageChange = (e) => {
        if (this.currentPageInput.value >= this.pages) {
            this.currentPageInput.value = this.pages;
        }
        this.setState({
            currentPage: this.currentPageInput.value
        });

        this.props.onGotoPage(this.currentPageInput.value);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.currentPage != prevState.currentPage) {
            return {
               currentPage: nextProps.currentPage 
            }
        }
    }

    render() {
        let totalRecords = this.props.totalRecords;
        let pages = Math.ceil(totalRecords / this.props.pageLength);
        this.pages = pages;

        let pageSelector = (
            <Fragment key="f-page-selector">
                <span key="page-selector" className="page-selector">
                    Rows per page:
                    <input key="page-input"
                      type="number"
                      min="1"
                      ref={(input)=>this.pageLengthInput = input}
                      defaultValue={this.props.pageLength || 5}
                      onChange={this.onPageLengthChange}
                    />
                </span>
            </Fragment>
        );

        let prevButton = (
            <button key="prev"
                className="pagination-btn prev"
                onClick={this.onPrevPage}>
                {"<"}
            </button>

        );

        let nextButton = (
            <button key="next"
                className="pagination-btn next"
                onClick={this.onNextPage}>
                {">"}
            </button>

        );

        let buttons = [];
        if (this.props.type === "long") {
            for(let i = 1; i <= pages; i++) {
                buttons.push(this._getPaginationButtons(i));
            }
        } else if (this.props.type === "short") {
            buttons.push(
                <input key="currentPageInput"
                    className="current-page-input"
                    type="number"
                    max={this.pages}
                    defaultValue={this.state.currentPage}
                    ref={(input)=>{this.currentPageInput=input}}
                    onChange={this.onCurrentPageChange} />
            );
        }

        return (
            <div className="pagination">
            {
                [pageSelector, prevButton, buttons, nextButton]
            }
            </div>
        );
    }
}