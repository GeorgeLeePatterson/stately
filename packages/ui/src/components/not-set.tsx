export const NotSet = ({ override }: { override?: React.ReactNode }) => (
  <span className="text-sm ml-2 text-muted-foreground italic">{override ?? '[Not set]'}</span>
);
