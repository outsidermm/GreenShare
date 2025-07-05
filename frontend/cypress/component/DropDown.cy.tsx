import DropDown from "@/components/DropDown";
import { Option } from "@/types/option";

interface DropDownProps {
  selectedOption: Option | null;
  setSelectedOption: (option: Option | null) => void;
  options: Array<Option>;
  label_text: string;
  placeholder: string;
  styles?: object;
  required?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  noOptionsMessage?: () => string;
  loadingMessage?: () => string;
  onInputChange?: (inputValue: string) => void;
  isLoading?: boolean;
  width?: string;
}

beforeEach(() => {
  document.body.classList.add('light');
})

describe('<DropDown />', () => {
  let baseProps: DropDownProps

  beforeEach(() => {
    baseProps = {
      selectedOption: null,
      setSelectedOption: cy.stub().as('setSelectedOption'),
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
      label_text: 'Select an option',
      placeholder: 'Choose...',
    };
  });

  it('renders label and placeholder', () => {
    cy.mount(<DropDown {...baseProps} />);
    cy.contains('label', baseProps.label_text).should('exist');
    cy.contains('Choose').should('exist');
  });

  it('renders options correctly', () => {
    cy.mount(<DropDown {...baseProps} />);
    cy.get('input').click();
    baseProps.options.forEach(option => {
      cy.contains(option.label).should('exist');
    });
  });

  it('calls setSelectedOption when an option is selected', () => {
    cy.mount(<DropDown {...baseProps} />);
    cy.get('input').click();
    cy.contains('Option 2').click();
    cy.get('@setSelectedOption').should('have.been.calledWith', baseProps.options[1]);
  });
});