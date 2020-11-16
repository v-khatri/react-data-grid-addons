import 'react-select/dist/react-select.css';
import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { isEmptyArray } from 'common/utils';
import Column from 'common/prop-shapes/Column';

class AutoCompleteFilter extends React.Component {
  constructor(props) {
    super(props);
    this.getOptions = this.getOptions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.filterValueOnInput = this.filterValueOnInput.bind(this);
    this.filterValues = this.filterValues.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.state = { options: this.getOptions(), rawValue: '', placeholder: 'Runng' };
  }

  componentWillReceiveProps(newProps) {
    this.setState({ options: this.getOptions(newProps) });
  }

  getOptions(newProps) {
    const props = newProps || this.props;
    let options = props.getValidFilterValues(props.column.key);
    options = options.map(o => {
      if (typeof o === 'string') {
        return { value: o, label: o };
      }
      return o;
    });
    return options;
  }

  columnValueContainsSearchTerms(columnValue, filterTermValue, caller) {
    if (columnValue !== undefined && filterTermValue !== undefined) {
      const strColumnValue = columnValue.toString();
      const strFilterTermValue = filterTermValue.toString();
      const checkValueIndex = strColumnValue.trim().toLowerCase().indexOf(strFilterTermValue.trim().toLowerCase());
      return checkValueIndex !== -1 && caller === "onchange" ? (checkValueIndex !== 0 || strColumnValue === strFilterTermValue) : (checkValueIndex === 0);
    }
    return false;
  }

  filterValues(row, columnFilter, columnKey, caller = "onchange") {
    let include = true;
    if (columnFilter === null) {
      include = false;
    } else if (columnFilter.filterTerm && !isEmptyArray(columnFilter.filterTerm)) {
      if (columnFilter.filterTerm.length) {
        include = columnFilter.filterTerm.some(filterTerm => {
          return this.columnValueContainsSearchTerms(row[columnKey], filterTerm.value, caller) === true;
        });
      } else {
        include = this.columnValueContainsSearchTerms(row[columnKey], columnFilter.filterTerm.value, caller);
      }
    }
    return include;
  }

  filterValueOnInput(row, columnFilter, columnKey){

    return this.filterValues(row, columnFilter, columnKey, "input");
  }



  handleChange(value) {
    const filters = value;
    this.setState({ filters });
    this.props.onChange({ filterTerm: filters, column: this.props.column, rawValue: value, filterValues: this.filterValues });
  }

  handleInputChange(value){
    if(value.length == 0 || !this.props.custom) return
    const filters = [{value, label: value}];
    this.props.onChange({ filterTerm: filters, column: this.props.column, rawValue: value, filterValues: this.filterValueOnInput });
  }


  render() {
    return (
      <Select
        autosize={false}
        name={`filter-${this.props.column.key}`}
        options={this.state.options}
        placeholder={this.state.placeholder}
        onChange={this.handleChange}
        escapeClearsValue={true}
        onInputChange={this.props.custom ? this.handleInputChange : undefined}
        multi={this.props.multiSelection !== undefined && this.props.multiSelection !== null ? this.props.multiSelection : true}
        value={this.state.filters} />
    );
  }
}

AutoCompleteFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  column: PropTypes.shape(Column),
  getValidFilterValues: PropTypes.func,
  multiSelection: PropTypes.bool
};

export default AutoCompleteFilter;
