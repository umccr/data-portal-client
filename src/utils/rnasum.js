/**
 * Defining DATASET option available for RNAsum
 * Ref: https://github.com/umccr/RNAsum/blob/master/TCGA_projects_summary.md
 */
export const PRIMARY_DATASETS_OPTION = [
  {
    project: 'BRCA',
    name: 'Breast Invasive Carcinoma',
    tissue_code: '1',
    samples_no: '300',
  },
  {
    project: 'THCA',
    name: 'Thyroid Carcinoma',
    tissue_code: '1',
    samples_no: '300',
  },
  {
    project: 'HNSC',
    name: 'Head and Neck Squamous Cell Carcinoma',
    tissue_code: '1',
    samples_no: '300',
  },
  {
    project: 'LGG',
    name: 'Brain Lower Grade Glioma',
    tissue_code: '1',
    samples_no: '300',
  },
  {
    project: 'KIRC',
    name: 'Kidney Renal Clear Cell Carcinoma',
    tissue_code: '1',
    samples_no: '300',
  },
  {
    project: 'LUSC',
    name: 'Lung Squamous Cell Carcinoma',
    tissue_code: '1',
    samples_no: '300',
  },
  {
    project: 'LUAD',
    name: 'Lung Adenocarcinoma',
    tissue_code: '1',
    samples_no: '300',
  },
  {
    project: 'PRAD',
    name: 'Prostate Adenocarcinoma',
    tissue_code: '1',
    samples_no: '300',
  },
  {
    project: 'STAD',
    name: 'Stomach Adenocarcinoma',
    tissue_code: '1',
    samples_no: '300',
  },
  {
    project: 'LIHC',
    name: 'Liver Hepatocellular Carcinoma',
    tissue_code: '1',
    samples_no: '300',
  },
  {
    project: 'COAD',
    name: 'Colon Adenocarcinoma',
    tissue_code: '1',
    samples_no: '257',
  },
  {
    project: 'KIRP',
    name: 'Kidney Renal Papillary Cell Carcinoma',
    tissue_code: '1',
    samples_no: '252',
  },
  {
    project: 'BLCA',
    name: 'Bladder Urothelial Carcinoma',
    tissue_code: '1',
    samples_no: '246',
  },
  {
    project: 'OV',
    name: 'Ovarian Serous Cystadenocarcinoma',
    tissue_code: '1',
    samples_no: '220',
  },
  {
    project: 'SARC',
    name: 'Sarcoma',
    tissue_code: '1',
    samples_no: '214',
  },
  {
    project: 'PCPG',
    name: 'Pheochromocytoma and Paraganglioma',
    tissue_code: '1',
    samples_no: '177',
  },
  {
    project: 'CESC',
    name: 'Cervical Squamous Cell Carcinoma and Endocervical Adenocarcinoma',
    tissue_code: '1',
    samples_no: '171',
  },
  {
    project: 'UCEC',
    name: 'Uterine Corpus Endometrial Carcinoma',
    tissue_code: '1',
    samples_no: '168',
  },
  {
    project: 'PAAD',
    name: 'Pancreatic Adenocarcinoma',
    tissue_code: '1',
    samples_no: '150',
  },
  {
    project: 'TGCT',
    name: 'Testicular Germ Cell Tumours',
    tissue_code: '1',
    samples_no: '149',
  },
  {
    project: 'LAML',
    name: 'Acute Myeloid Leukaemia',
    tissue_code: '3',
    samples_no: '145',
  },
  {
    project: 'ESCA',
    name: 'Esophageal Carcinoma',
    tissue_code: '1',
    samples_no: '142',
  },
  {
    project: 'GBM',
    name: 'Glioblastoma Multiforme',
    tissue_code: '1',
    samples_no: '141',
  },
  {
    project: 'THYM',
    name: 'Thymoma',
    tissue_code: '1',
    samples_no: '118',
  },
  {
    project: 'SKCM',
    name: 'Skin Cutaneous Melanoma',
    tissue_code: '1',
    samples_no: '100',
  },
  {
    project: 'READ',
    name: 'Rectum Adenocarcinoma',
    tissue_code: '1',
    samples_no: '87',
  },
  {
    project: 'UVM',
    name: 'Uveal Melanoma',
    tissue_code: '1',
    samples_no: '80',
  },
  {
    project: 'ACC',
    name: 'Adrenocortical Carcinoma',
    tissue_code: '1',
    samples_no: '78',
  },
  {
    project: 'MESO',
    name: 'Mesothelioma',
    tissue_code: '1',
    samples_no: '77',
  },
  {
    project: 'KICH',
    name: 'Kidney Chromophobe',
    tissue_code: '1',
    samples_no: '59',
  },
  {
    project: 'UCS',
    name: 'Uterine Carcinosarcoma',
    tissue_code: '1',
    samples_no: '56',
  },
  {
    project: 'DLBC',
    name: 'Lymphoid Neoplasm Diffuse Large B-cell Lymphoma',
    tissue_code: '1',
    samples_no: '47',
  },
  {
    project: 'CHOL',
    name: 'Cholangiocarcinoma',
    tissue_code: '1',
    samples_no: '34',
  },
];

export const EXTENDED_DATASETS_OPTION = [
  {
    no: '1',
    project: 'LUAD-LCNEC',
    name: 'Lung Adenocarcinoma dataset including large-cell neuroendocrine carcinoma (LCNEC, n=14)',
    tissue_code: '1',
    samples_no: '314',
  },
  {
    no: '2',
    project: 'BLCA-NET',
    name: 'Bladder Urothelial Carcinoma dataset including neuroendocrine tumours (NETs, n=2)',
    tissue_code: '1',
    samples_no: '248',
  },
  {
    no: '3',
    project: 'PAAD-IPMN',
    name: 'Pancreatic Adenocarcinoma dataset including intraductal papillary mucinous neoplasm (IPMNs, n=2)',
    tissue_code: '1',
    samples_no: '152',
  },
  {
    no: '4',
    project: 'PAAD-NET',
    name: 'Pancreatic Adenocarcinoma dataset including neuroendocrine tumours (NETs, n=8)',
    tissue_code: '1',
    samples_no: '158',
  },
  {
    no: '5',
    project: 'PAAD-ACC',
    name: 'Pancreatic Adenocarcinoma dataset including acinar cell carcinoma (ACCs, n=1)',
    tissue_code: '1',
    samples_no: '151',
  },
];

export const PAN_CANCER_DATASETS_OPTION = [
  {
    project: 'PANCAN',
    name: 'Samples from all 33 cancer types, 10 samples from each',
    tissue_code: '1 and 3 (LAML samples only)',
    samples_no: '330',
  },
];
