import Checkbox, { CheckboxProps } from "@mui/material/Checkbox";
import { styled } from "@mui/material/styles";

interface BpCheckboxProps extends CheckboxProps {
    checkboxsize?: number; // size prop to control the size of the checkbox
}

const BpIcon = styled('span')<{ checkboxsize: number }>(({ checkboxsize, theme }) => ({
    borderRadius: 3,
    width: checkboxsize,
    height: checkboxsize,
    boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
    border: "2px solid #888",
    '.Mui-focusVisible &': {
        outline: '2px auto rgba(19,124,189,.6)',
        outlineOffset: 2,
    },
    'input:disabled ~ &': {
        boxShadow: 'none',
        background: 'rgba(206,217,224,.5)',
        ...theme.applyStyles('dark', {
            background: 'rgba(57,75,89,.5)',
        }),
    },
    ...theme.applyStyles('dark', {
        boxShadow: '0 0 0 1px rgb(16 22 26 / 40%)',
        backgroundColor: '#394b59',
    }),
}));

const BpCheckedIcon = styled(BpIcon)<{ checkboxsize: number }>(({ checkboxsize }) => ({
    backgroundColor: '#080',
    border: "0px solid #888",
    '&::before': {
        display: 'block',
        width: checkboxsize,
        height: checkboxsize,
        backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
            " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
            "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
        content: '""',
    },
    'input:hover ~ &': {
        backgroundColor: '#080',
    },
}));

const BpIndeterminateIcon = styled(BpIcon)<{ checkboxsize: number }>(({ checkboxsize }) => ({
    backgroundColor: '#888',
    border: "0px solid #888",
    '&::before': {
        display: 'block',
        width: checkboxsize,
        height: checkboxsize,
        backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
            " fill-rule='evenodd' clip-rule='evenodd' d='M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8' stroke='%23fff' stroke-width='1.5' fill='%23fff'/%3E%3C/svg%3E\")",
        content: '""',
    }
}));

export function BpCheckbox(props: BpCheckboxProps) {
    const { checkboxsize = 20, ...rest } = props; // Default size is 20
    return (
        <Checkbox
            sx={{ '&:hover': { bgcolor: 'transparent' } }}
            color="default"
            checkedIcon={<BpCheckedIcon checkboxsize={checkboxsize} />}
            indeterminateIcon={<BpIndeterminateIcon checkboxsize={checkboxsize} />}
            icon={<BpIcon checkboxsize={checkboxsize} />}
            {...rest}
        />
    );
}
