import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface MapProps {}

const StyledMap = styled.div`
  color: pink;
`;

export function Map(props: MapProps) {
  return (
    <StyledMap>
      <h1>Welcome to Map!</h1>
    </StyledMap>
  );
}

export default Map;
