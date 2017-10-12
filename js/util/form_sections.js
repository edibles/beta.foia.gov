import requestFormToJsonSchema from './request_form_to_json_schema';
const FORM_SECTIONS = [
  {
    id: 'requester_contact',
    title: 'Requester contact',
    description: 'Complete the information describing yourself and how the agency can contact you about your request.',
    fieldNames: [
      'name_prefix_title',
      'name_first',
      'name_middle_initial_middle',
      'name_last',
      'name_suffix',
      'address_line1',
      'address_line2',
      'address_city',
      'address_state_province',
      'address_country',
      'address_zip_postal_code',
      'phone_number',
      'fax_number',
      'suffix',
      'company_organization',
      'email',

       // deprecated names https://github.com/18F/beta.foia.gov/issues/188
      'prefix_title',
      'first_name',
      'last_name',
      'middle_initial_middle_name',
      'suffix',
      'mailing_address_line_1',
      'mailing_address_line_2',
      'city',
      'country',
      'state_province',
      'zip_postal_code',

    ],
  },

  {
    id: 'request_description',
    title: 'Request description',
    description: 'Describe the records you are requesting. Be as specific as possible.',
    fieldNames: [
      'request_description',
      'request_category',
      'attachments_supporting_documentation',
    ],
  },

  {
    id: 'delivery_method',
    title: 'Delivery method',
    description: 'How would you like to receive your request? Under certain circumstances you may need to pay for processing fees.',
    fieldNames: [
      'request_processing_fees',
      'processing_fees',
      'delivery_method',
      'request_fee_waiver',
      'fee_waiver_explanation',
      'request_expedited_processing',
      'expedited_processing_explanation',
    ],
  },
];

const ADDITIONAL_FIELDS_SECTION = {
  id: 'additional_fields',
  title: 'Additional fields',
  description: 'This addtional information may be helpful for the agency to fulfill your FOIA request.',
};

const fieldToSectionMap = FORM_SECTIONS
  .reduce((memo, section) =>
    section
      .fieldNames
      .reduce((map, fieldName) => Object.assign(map, { [fieldName]: section }), memo)
  , {});


function findSection(field) {
  return field.name in fieldToSectionMap ?
    fieldToSectionMap[field.name] :
    ADDITIONAL_FIELDS_SECTION;
}

function bucketFieldsBySection(formFields) {
  // Make sure to maintain the order by processing these in formFields order
  return formFields
    .reduce((form, field) => {
      const section = findSection(field);
      const sectionFields = form[section.id] || [];

      sectionFields.push(field);
      form[section.id] = sectionFields;
      return form;
    }, {});
}

function formSections(agencyComponent) {
  const fieldsBySection = bucketFieldsBySection(agencyComponent.formFields || []);

  const result = FORM_SECTIONS
    .concat([ADDITIONAL_FIELDS_SECTION])
    // Skip empty sections
    .filter(section => section.id in fieldsBySection)
    .map((section) => {
      // Use only the form fields in this section
      const formFields = fieldsBySection[section.id];

      const { jsonSchema, uiSchema } = requestFormToJsonSchema(formFields, section);

      // Pass a triplet for processing
      return [section.id, jsonSchema, uiSchema];
    })
    .reduce((form, [sectionId, jsonSchema, uiSchema]) => {
      form.properties[sectionId] = jsonSchema;
      form.uiSchema[sectionId] = uiSchema;
      return form;
    }, { properties: {}, uiSchema: {} });

  return {
    jsonSchema: {
      title: agencyComponent.title,
      type: 'object',
      properties: result.properties,
    },
    uiSchema: result.uiSchema,
  };
}

export default formSections;
