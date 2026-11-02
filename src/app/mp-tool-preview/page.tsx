import MpToolStudentView from '@/components/mp-tool/MpToolStudentView';

export default function MpToolPreviewPage() {
    return (
        <MpToolStudentView
            question="How confident do you feel today?"
            lowLabel="Not at all confident"
            highLabel="Very confident"
        />
    );
}
