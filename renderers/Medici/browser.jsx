<Medici>
  <Event id="handleClickBack">
    this.onBack();
  </Event>
  <Event id="handleClickHome">
    this.onNavigate('@exactchange:page:featured');
  </Event>
  <Event id="handleClickExit">
    process.exit();
  </Event>
  <%ROOT%>
  <Input value="@exactchange:page:featured" placeholder="Search apps & content..." x={72} y={0} width={952} height={36} />
  <Rect fill style="#00000060" x={0} y={0} width={36} height={36} click="handleClickBack">
    <Text fill style="linear-gradient(#80088090, #ff000050)" text="←" size={11} maxWidth={24} x={13} y={22} />
    <Rect fill style="linear-gradient(#80088050, #ff000050)" x={0} y={36} width={36} height={1} />
  </Rect>
  <Rect fill style="#80088020" x={36} y={0} width={36} height={36} click="handleClickHome">
    <Text fill style="linear-gradient(#80088050, #ff000050)" text="⌂" size={15} maxWidth={24} x={13} y={22} />
    <Rect fill style="linear-gradient(#80088050, #ff000050)" x={0} y={36} width={36} height={1} />
  </Rect>
  <Rect fill style="#ff000010" x={988} y={0} width={36} height={36} click="handleClickExit">
    <Text fill style="linear-gradient(#80088090, #ff000050)" text="✕" size={11} maxWidth={24} x={13} y={22} />
    <Rect fill style="linear-gradient(#80088050, #ff000050)" x={0} y={36} width={36} height={1} />
  </Rect>
</Medici>
